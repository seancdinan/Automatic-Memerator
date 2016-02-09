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

// Have some test phrases to play around with
testPhrases = ['@SomeHandle When ur hungry-af but - every restaurant is closed.',
							'When ur pizza sandwich and everybody else',
							'this one shouldnt even work lol',
							'and this one might break when it comes to it',
							'and this one is the real test when its tricky but it works'];

// Takes a list of options, filters out the bad ones, and outputs a random choice
function getFirstPhrase(inputArray) {
	var options = [], testHolder = [], selection;
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
	// Make a random selection from the options and return it as a string
	var success = false;
	while(success == false) {
		selection = Math.floor(Math.random() * (options.length));
		if (options[selection] != undefined) {return options[selection]; success = true;}
	}	
}
// Same purpose as getFirstPhrase, but for the second half of the tweet
function getSecondPhrase(inputArray, firstLength) {
	var options = [], selection, startIndex;
	for (var i = 0; i < inputArray.length; i++) {
		var endIndex, temp = [];
		if (inputArray[i].indexOf(' - ') != -1) {
			endIndex = inputArray[i].indexOf(' - ');
			if (inputArray[i].indexOf(':') != -1) {startIndex = inputArray[i].indexOf(':') + 2;}
			else startIndex = 0;
			var index = startIndex;
			for (var n = 0; n < (endIndex - startIndex); n++) {
				temp[n] = inputArray[i][index];
				index++;
			}
			if (temp[0] != undefined) {temp[0] = temp[0].toLowerCase();};
			options[i] = temp.join('');
		}
	}

	for (var k = 0; k < options.length; k++){
		selection = Math.floor(Math.random() * (options.length));
		if (options[selection] != undefined && (options[selection].length + firstLength) <= 140) {
			return options[selection];
		}
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
	var firstTweets = [], secondTweets = [];

	// Get the 1st phrase
	T.get('search/tweets',{q:'when%20ur%20AND%20so%20OR%20but', result_type:'recent', count:searchAmt},
		function(err, data, response) {
			if (!err) {
				for (var i = 0; i < data["statuses"].length; i++) {firstTweets[i] = data["statuses"][i]["text"];}
				var firstPick = getFirstPhrase(firstTweets);
				console.log(firstPick);

				// Get the second phrase
				T.get('statuses/user_timeline',{screen_name:'BreakingNews', count:searchAmt},
					function(err, data, response) {
						if (!err) {
							for (var i = 0; i < data.length; i++) {secondTweets[i] = data[i]["text"];}
							for (var i = 0; i < secondTweets.length; i++) {
								var secondPickTry = getSecondPhrase(secondTweets, firstPick.length);
								if (secondPickTry != undefined && (secondPickTry.length + firstPick.length) <= 140) {
									var secondPick = secondPickTry;
								}
								else var secondPick = undefined;
							}
							console.log(secondPick);
							// Combine them together
							var tweetText = compileParts(firstPick, secondPick);
							// Pick a random image
							var img = getImage(rxnOptions, './reactions/'); console.log(img);
							var b64content = fs.readFileSync(img, {encoding: 'base64'})

							// Make the post
							if (secondPick == undefined || secondPick == null || secondPick == '') {console.log('No second pick.');}
							if (secondPick != undefined && secondPick != null && secondPick != '' && (140 - tweetText.length) >= 23) {
								T.post('media/upload',{media_data: b64content},
									function(err, data, response) {
										var mediaIdStr = data.media_id_string;
										var params = {status: tweetText, media_ids: [mediaIdStr]};
									T.post('statuses/update', params, function (err, data, response) {
										console.log(data['text']);
										})
									})
							}
							else if (secondPick != undefined && secondPick != null && secondPick != '' && (140 - tweetText.length) < 23) {
								T.post('statuses/update', {status: tweetText}, function (err, data, response){console.log(data['text']);})
							}
							else console.log('Tweet exceeds 140 characters\n*****************************************************');
						}
						else console.log('There was an error getting the 2nd half of the tweet');
				});	
			}
			else console.log('There was an error getting the 1st half of the tweet');
		}); 
}

// Run every x number of seconds.
// Use ctrl-c to stop process in terminal
//setInterval(fireMeme(75), 15000);
setInterval(function() {
	try {
		fireMeme(95);
	}
	catch (e) {
		console.log(e);
	}
}, 60000);








