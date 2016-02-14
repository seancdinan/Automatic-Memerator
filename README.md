# Automatic-Memerator
### [Automating the Twittersphere's reaction to breaking news.](https://twitter.com/AutoMemerator)
## Goals:
* Automatically generate stereotypical reaction tweets to breaking news
* Use JavaScript with Node.js to create a Twitterbot
* Learn to use API endpoints to make `POST` and `GET` requests
* Learn to make asynchronous calls and use callback functions
* Learn to access data from JSON objects
* Practice creating functions that achieve a goal effectively

## Premise:
1. Create an array of tweets containing "When, ur, but, and"
  * e.g. "when ppl make plans and ur standing right next to them but they don't invite u"
2. Create an array of tweet stems starting at "when" and ending at "and" or "but", then pick a random one
  * e.g. "when ppl make plans and"
3. Create an array of news headlines plucked from a bunch of news subreddits, then pick a random one
4. Format the headline to adjust for capitilization
5. If the total length of the tweet stem + news headline is less than 117 chars, also pick a random reaction gif from a small database
6. Send a tweet containing tweet stem + headline (+ image)
7. Set a timer to pull fresh tweets and headlines then post every x number of minutes
 

