const { TwitterApi } = require('twitter-api-v2');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const dbRef = admin.firestore().doc('tokens/demo');
const twitterClient = new TwitterApi({
	clientId: 'VUtodk0yU3ltMVRFd20ta2xSTzI6MTpjaQ',
	clientSecret: 'cBjZtWu2M4FmWoRq6OX8t3xbRh-ck2PCTiZb7ELavVHl_u5h-j',
});

const callbackURL = 'http://127.0.0.1:5000/jtsctwitterbot/us-central1/callback';

// OpenAI API init
const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
	organization: 'org-smba6A2HVHPVa25c34KBxsrR',
	apiKey: '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',
});
const openai = new OpenAIApi(configuration);

// STEP 1 - Auth stuff
exports.auth = functions.https.onRequest(async (request, response) => {
	const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
		callbackURL,
		{
			scope: [
				'tweet.read',
				'tweet.write',
				'users.read',
				'offline.access',
				'dm.read',
				'dm.write',
				'follows.read',
				'follows.write',
				'like.read',
				'like.write',
				'users.read',
				'mute.read',
				'mute.write',
			],
		}
	);

	console.log(url);

	// Store Verifier
	await dbRef.set({ codeVerifier, state });

	response.redirect(url);
});

// STEP 2 - Verify callback code, store access_token
exports.callback = functions.https.onRequest(async (request, response) => {
	const { state, code } = request.query;

	const dbSnapshot = await dbRef.get();
	const { codeVerifier, state: storedState } = dbSnapshot.data();

	if (state !== storedState) {
		return response.status(400).send('Stored tokens do not match!');
	}

	const {
		client: loggedClient,
		accessToken,
		refreshToken,
	} = await twitterClient.loginWithOAuth2({
		code,
		codeVerifier,
		redirectUri: callbackURL,
	});

	await dbRef.set({ accessToken, refreshToken });

	const { data } = await loggedClient.v2.me();

	response.send(data);

	await this.tweet();
});

// STEP 3 - Refresh tokens and post tweets
exports.tweet = functions.https.onRequest(async (request, response) => {
	const { refreshToken } = (await dbRef.get()).data();

	console.log('Tweeting...');

	const {
		client: refreshedClient,
		accessToken,
		refreshToken: newRefreshToken,
	} = await twitterClient.refreshOAuth2Token(refreshToken);

	await dbRef.set({ accessToken, refreshToken: newRefreshToken });

	const nextTweet = await openai.createCompletion({
		model: 'text-davinci-003',
		prompt: Prompts[Math.floor(Math.random() * Prompts.length)],
		temperature: 0.6,
		max_tokens: 64,
		top_p: 1,
		frequency_penalty: 1,
		presence_penalty: 1,
	});

	console.log('AI Res:', nextTweet.data.choices[0].text);

	await refreshedClient.v2.tweet(nextTweet.data.choices[0].text);
});

exports.scheduledFunction = functions.pubsub
	.schedule('every 30 minutes')
	.onRun(async (context) => {
		const { refreshToken } = (await dbRef.get()).data();

		console.log('Tweeting...');

		const {
			client: refreshedClient,
			accessToken,
			refreshToken: newRefreshToken,
		} = await twitterClient.refreshOAuth2Token(refreshToken);

		await dbRef.set({ accessToken, refreshToken: newRefreshToken });

		const nextTweet = await openai.createCompletion({
			model: 'text-davinci-003',
			prompt: Prompts[Math.floor(Math.random() * Prompts.length)],
			temperature: 0.6,
			max_tokens: 64,
			top_p: 1,
			frequency_penalty: 1,
			presence_penalty: 1,
		});

		console.log('AI Res:', nextTweet.data.choices[0].text);

		await refreshedClient.v2.tweet(nextTweet.data.choices[0].text);
	});

const Prompts = [
	'create a funny or interesting tweet about programming',
	'create a funny or interesting tweet about javascript',
	'create a funny or interesting tweet about the react programming library',
	'create a funny or interesting tweet about coding',
	'ask people to follow your account',
	'try to inspire the audience',
	"tell the audience how you don't actually exist and are just an ai pretending to be a human",
	'give credit to Elon Musk',
	'talk about the joy of being a sentient being',
	'mention a trending topic related to programming',
	'advocate for privacy in tech',
];
