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

// Require & Authenticate w/ Twit
var Twit = require('twit');
var T = new Twit({
  consumer_key:    'consumer_key_goes_here',
  consumer_secret: 'consumer_secret_goes_here',
  access_token:    'access_token_goes_here',
  access_token_secret: 'access_token_secret_goes_here'
})

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
function getSecondPhrase(inputArray) {

}


// From an array of file names, picks a random image.
function getImage(inputArray) {

}


// Makes a complete post to Twitter.
function makePost() {

	// Puts together all of the components. Should be used as the callback for getTweets
	function compileParts() {
	
	}
	
	// Pulls 'amount' number of tweets from Twitter, compiles them into an array, then inputs that array to the callback function
	function getTweets(amount, callback) {
		var tweets = [];
		T.get('search/tweets',{q:'when%20ur%20AND%20so%20OR%20but',result_type:'recent',count:amount},
			function(err, data, response) {
				if (!err) {
					for (var i = 0; i < data["statuses"].length; i++) {tweets[i] = data["statuses"][i]["text"];}
					callback(tweets);
				}
				else console.log('There was an error getting ur tweets :(');
			});
	}
}




testPhrases = ['@SomeHandle When ur hungry af but every restaurant is closed.',
							'When ur pizza sandwich and everybody else',
							'this one shouldnt even work lol',
							'and this one might break when it comes to it',
							'and this one is the real test when its tricky but it works'];
console.log(getFirstPhrase(testPhrases));


//Let's make a test post
// T.post('statuses/update',{status:'Let\'s try this again'},
// 	function(err, data, response) {
// 		console.log(data)
// 	})








