// Here's my attempt at making a Twitter bot.
// The goal is simple: to make trashy meme posts formulaically.
//
// The bot uses Twit to communicate with the
// Twitter API via Node.js as follows:
// First, a search is performed for tweets with
// "when ur AND so OR but" as the query, taking 50 of the most
// recent results at a time.
// Then, the text fields of each result are thrown into an array.
// The results that don't start with "when" get discarded.
// Then, one of the remaining results gets selected at random.
// It's split in two at the coordinating conjunction(and/or/but),
// Then the first half is stored.
//
// Sample of combinator:
// var str = 'When ur hungry af but Bruces is closed';
// var phrase1 = str.split("but");
// var coordConj = ['and','but','yet','so'];
// console.log(phrase1[0]+coordConj[Math.floor(Math.random()*coordConj.length)] +phrase1[1]);

// Require & Authenticate w/ Twit, load up the reaction image database, require Cron to time tweet sends
var Twit = require('twit');
var T = new Twit({
 consumer_key:    'consumer_key_goes_here',
 consumer_secret: 'consumer_secret_goes_here',
 access_token:    'access_token_goes_here',
 access_token_secret: 'access_token_secret_goes_here'
})
var rxnOptions = require('./reactionOptions.js');
var fs = require('fs');
var CronJob = require('cron').CronJob;
var request = require('request');


// Have some test phrases to play around with
testPhrases = ['@SomeHandle When ur hungry-af but - every restaurant is closed.',
							'When ur pizza sandwich and everybody else',
							'this one shouldnt even work lol',
							'and this one might break when it comes to it',
							'and this one is the real test when its tricky but it works'];

var previousFirstPhrase;


function removeRepeats(array) {
	var filteredArray = [array[0]];
	var filterIndex = 1;
	var alreadyExists;
	for (var i = 1; i < array.length; i++) {
		for (var k = 0; k < filteredArray.length; k++) {
			if (array[i] == filteredArray[k]) {alreadyExists = true; break}
			else alreadyExists = false	
		}
		if (alreadyExists == false) {
			filteredArray[filterIndex] = array[i];
			filterIndex++;
		}
	}
	return filteredArray;
}

// Takes a list of options, filters out the bad ones, and outputs a random choice
function getFirstPhrase(inputArray) {
	var options = [], testHolder = [], selection, decision;
	// Go thru each element of inputArray, if a matching phrase is found, store it in the options array.
	for (var i = 0; i < inputArray.length; i++) {
		var whenIndex, andButIndex, temp = [], hasWhen = false, hasAndBut = false;
		testHolder = inputArray[i].toLowerCase();
		testHolder = testHolder.split(' ');

		// Find instance of WHEN
		for (var n = 0; n < testHolder.length; n++) {
			if (testHolder[n] == 'when') {
				whenIndex = n;
				hasWhen = true;
				break;}
		}
		// Find instance of BUT or AND
		for (var n = whenIndex; n < testHolder.length; n++){
			if (testHolder[n] == 'but' || testHolder[n] == 'and') {
				andButIndex = n;
				hasAndBut = true;
				break;}
		}

		// If both exist, form a string from when to and/but
		if (hasWhen == true && hasAndBut == true) {
			var counter = 0;
			for (var m = whenIndex; m <= andButIndex; m++) {
				temp[counter] = testHolder[m];
				counter++;
			} 
			options[i] = temp.join(' ');
		}
	}
	//console.log(options);
	// Make a random selection from the options and return it as a string
	var filterIndex = 0;
	var filteredOptions = removeRepeats(options);
	for (var i = 0; i < options.length; i++) {
		if (options[i] != undefined) {
			filteredOptions[filterIndex] = options[i];
			filterIndex++;
		}
	}
	selection = Math.floor(Math.random() * filteredOptions.length);
	return filteredOptions[selection];
	}

function getRedditPhrase(inputArray, firstLength) {
	var options = [], selection;
	for (var i = 0; i < inputArray.length; i++) {
		if (inputArray[i].length + firstLength <= 140) {
			options[i] = inputArray[i];
		}
	}
	var filteredOptions = removeRepeats(options);
	for (var i = 0; i < filteredOptions.length; i++) {
		selection = Math.floor(Math.random() * filteredOptions.length);
		if (filteredOptions[selection] != undefined)
			return filteredOptions[selection];
	}
}


// From an array of file names, picks a random image.
function getImage(inputArray, filepath) {
	var selection = inputArray[Math.floor(Math.random() * inputArray.length)];
	var result = [filepath, selection].join('');
	return result;
}
// Combines two strings together
function compileParts(input1, input2) {
	var result = [input1, input2].join(' ');
	return result;
}

function fireMeme(searchAmt) {
	var firstTweets = [], secondTweets = [], redditNews = [];

	// Get the 1st phrase
	T.get('search/tweets',{q:'when%20ur%20and%20but', result_type:'recent', count:searchAmt},
		function(err, data, response) {
			if (!err) {
				for (var i = 0; i < data["statuses"].length; i++) {firstTweets[i] = data["statuses"][i]["text"];}
				var firstPick = getFirstPhrase(firstTweets);
				console.log(firstPick);
				// Get the second phrase from reddit/news/hot/
				request({url: 'https://www.reddit.com/r/news+worldnews+USANews+WorldEvents+Worldpolitics/hot/.json?count=100', json: true}, function(error, response, body) {

					for (var i = 0; i < body["data"]["children"].length; i++) {redditNews[i] = body["data"]["children"][i]["data"]["title"];}
					var secondPick = getRedditPhrase(redditNews, firstPick.length);
					secondPick[0] = secondPick[0].toLowerCase();
					console.log(secondPick);
					// Combine them together
					var tweetText = compileParts(firstPick, secondPick);
					// Pick a random image
					var img = getImage(rxnOptions, './reactions/'); console.log(img);
					var b64content = fs.readFileSync(img, {encoding: 'base64'})

					//Make the post
					if (secondPick == undefined || secondPick == null || secondPick == '') {console.log('No second pick.');}
					if (firstPick != undefined && firstPick != null && secondPick != undefined && secondPick != null && secondPick != '' && (140 - tweetText.length) >= 23) {
						T.post('media/upload',{media_data: b64content},
							function(err, data, response) {
								var mediaIdStr = data.media_id_string;
								var params = {status: tweetText, media_ids: [mediaIdStr]};
							T.post('statuses/update', params, function (err, data, response) {
								console.log(data['text']);
								})
							})
					}
					else if (firstPick != undefined && firstPick != null && secondPick != undefined && secondPick != null && secondPick != '' && (140 - tweetText.length) < 23) {
						T.post('statuses/update', {status: tweetText}, function (err, data, response){console.log(data['text']);})
					}
					else console.log('Tweet exceeds 140 characters\n*****************************************************');
				})	
			}
			else console.log('There was an error getting the 1st half of the tweet');
			}) 
}

// Run every x number of seconds.
// Use ctrl-c to stop process in terminal

setInterval(function() {
	try {
		fireMeme(95);
	}
	catch (e) {
		console.log(e);
	}
}, 300000);








