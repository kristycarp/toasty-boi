'use strict';

const Twitter = require('twitter');
let client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  bearer_token: process.env.TWITTER_BEARER_TOKEN
});

client.get('trends/place', { id: 1 }, (err, tweets, response) => {
  if (err) {
    throw err;
  }

  console.log(JSON.stringify(tweets));
});
