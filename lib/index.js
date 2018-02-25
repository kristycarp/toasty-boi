'use strict';

const nHashtags = 5;
var hashtagArray = [];

//twitter stuff
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

  var tweetArray = tweets[0]['trends'];
  if (tweetArray.length < nHashtags)
  {
  	nHashtags = tweetArray.length;
  }
  var offset = 0;
  for (var i = 0; i < nHashtags; i++)
  {
  	var notGood = true;
  	while (notGood)
  	{
  		var testHashtag = tweetArray[i + offset]['name'];
  		if (containsAllAscii(testHashtag))
  		{
  			notGood = false;
  			hashtagArray.push(testHashtag);
  		}
  		else
  		{
  			offset++;
  		}
  	}
  }
  gCodeStuff();
});
function containsAllAscii(str) {
    return  /^[\000-\177]*$/.test(str) ;
}

//emotion stuff
var request = require('request');
var options =
{
	url: 'https://westus.api.cognitive.microsoft.com/emotion/v1.0/recognize',
	headers:
	{
		'Ocp-Apim-Subscription-Key': process.env.EMOTION_KEY,
	},
	body:
	{
		'url':  'https://aka.ms/csnb-emotion-1'
	},
	json: true,
	method: 'POST'
};

function callback(error, response, body)
{
	if (error)
	{
		throw error;
	}
	else if (response.statusCode == 200)
	{
		var scoreDict = body[0]['scores'];
		var emotion = Object.keys(scoreDict).reduce(function(a,b){return scoreDict[a] > scoreDict[b] ? a : b});
	    console.log(emotion);
  	}
  	else
  	{
  		console.log(response.statusCode);
  		console.log(body);
  	}
}

request(options, callback);

//weather stuff
var cityID = 4930956 //arbitarily choose Boston
var theUrl = 'http://api.openweathermap.org/data/2.5/weather?id=' + cityID + '&APPID=' + process.env.WEATHER_KEY;
var options =
{
	uri: theUrl,
	headers:
	{
		'APIKEY': process.env.WEATHER_KEY
	},
	json: true,
	method: 'GET'
};
function weatherCallback(error, response, body)
{
	if (error)
	{
		throw error;
	}
	else if (response.statusCode == 200)
	{
		var firstSplit = body.split("[");
		var secondSplit = firstSplit[1].split("main");
		var thirdSplit = secondSplit[1].substring(3);
		var weatherWord = thirdSplit.split("\"")[0];
		console.log(weatherWord);
  	}
  	else
  	{
  		console.log(response.statusCode);
  		console.log(body);
  	}
}

request(theUrl, weatherCallback);

//let's do some gcode
function gCodeStuff()
{
	const { exec } = require('child_process');

	var commandLineStr = 'python engrave-lines.py -X7.5 -x5 -i\'123\' -Y12.75 -y5.25 -S0.4 -s0.5 -Z2 -D0.1';
	for (var i = 0; i < hashtagArray.length; i++)
	{
		commandLineStr += ' -' + String(i) + '\'' + hashtagArray[i] + '\'';
	}
	commandLineStr += ' > output.gcode'
	console.log(hashtagArray);

	exec(commandLineStr, (error, stdout, stderr) =>
	{
		if (error)
		{
			throw error;
		}

		console.log('nut');
	});
}