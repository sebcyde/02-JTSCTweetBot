const { TwitterApi } = require('twitter-api-v2');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const dbRef = admin.firestore().doc('tokens/demo');
const twitterClient = new TwitterApi({
	clientId: '',
	clientSecret: '',
});

exports.auth = functions.https.onRequest((request, response) => {});

exports.callback = functions.https.onRequest((request, response) => {});

exports.tweet = functions.https.onRequest((request, response) => {});
