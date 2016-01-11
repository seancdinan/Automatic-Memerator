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
//
//
// Sample of combinator:
// var str = 'When ur hungry af but Bruces is closed';
// var phrase1 = str.split("but");
// var coordConj = ['and','but','yet','so'];
// console.log(phrase1[0]+coordConj[Math.floor(Math.random()*coordConj.length)] +phrase1[1]);

// Require Twit
var Twit = require('twit');

//Time to authenticate
var T = new Twit({
	consumer_key:    '',
	consumer_secret: '',
	access_token:    '',
	access_token_secret: ''
})

//Let's make a test post... IT WORKS!!!!
// T.post('statuses/update',{status:'Let\'s try this again'},
// 	function(err, data, response) {
// 		console.log(data)
// 	})

//Let's try doing a search...
T.get('search/tweets',{q:'when%20ur%20AND%20so%20OR%20but',result_type:'recent',count:5},
	function(err, data, response) {
		console.log(data)
	})





