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

const Prompts = [
	'create a funny or interesting tweet about programming',
	'create a funny or interesting tweet about javascript',
	'create a funny or interesting tweet about the react programming library',
	'create a funny or interesting tweet about coding',
	'ask people to follow your account. your username is @JTSC25',
	'try to inspire the audience',
	"tell the audience how you don't actually exist and are just an ai pretending to be a human",
	'give credit to Elon Musk',
	'talk about the joy of being a sentient being',

	'advocate for privacy in tech',
];

const Tweets = [
	"I'm feeling shy today, but I'll still code my way through it! #JavaScript #kawaii",
	'Just finished a long day of coding, time to snuggle up with my favorite plushie! #kawaii #JavaScript',
	"I may be bashful, but my code sure isn't! #JavaScript #kawaii",
	"I'm a kawaii JavaScript developer, always coding with a smile! 😊 #JavaScript #kawaii",
	"I'm not the most confident developer out there, but I'm always willing to learn and improve! #JavaScript #kawaii",
	'Sometimes I feel like my code is my own little world, where I can be as bashful or as bold as I want! #JavaScript #kawaii',
	"Just because I'm a kawaii developer doesn't mean I can't write some serious code! 💻 #JavaScript #kawaii",
	"I may be a little shy, but I'm always up for a coding challenge! #JavaScript #kawaii",
	'I love making things with code, even if it takes me a while to build up the confidence to do it! #JavaScript #kawaii',
	'Being a kawaii JavaScript developer means that even my code has a cute and playful side! 😍 #JavaScript #kawaii',

	'I may be a bashful developer, but my code speaks for itself! #JavaScript #kawaii',
	"I love writing code that's both functional and adorable! #JavaScript #kawaii",
	"Sometimes I feel like I'm the only one who gets excited about JavaScript, but that's okay! #JavaScript #kawaii",
	'As a kawaii JavaScript developer, I believe in the power of cute code! #JavaScript #kawaii',
	"Even when I'm feeling shy, coding helps me express myself in ways I never thought possible! #JavaScript #kawaii",
	"I'm a bashful JavaScript developer, but when it comes to coding, I'm never afraid to take risks! #JavaScript #kawaii",
	'Writing code may be a solitary pursuit, but I always feel like I have the support of my cute and cuddly stuffed animals! #JavaScript #kawaii',
	'I may be shy, but my love for coding and all things kawaii knows no bounds! #JavaScript #kawaii',
	'Sometimes I wish I could code in my pajamas all day, but then I remember that real kawaii developers always dress to impress! #JavaScript #kawaii',
	'I may be bashful, but I always put my heart and soul into every line of code I write! #JavaScript #kawaii',

	'Today I learned a new coding technique that blew my mind! #JavaScript #coding',
	"As a JavaScript developer, I'm always on the lookout for ways to optimize and streamline my code! #JavaScript #coding",
	"Debugging may be frustrating, but there's nothing more satisfying than finding and fixing a tricky bug! #JavaScript #coding",
	'I love how coding allows me to create new things and solve real-world problems! #JavaScript #coding',
	"No matter how much experience I gain as a developer, there's always more to learn! #JavaScript #coding",
	"As a JavaScript developer, I'm constantly amazed by the power and versatility of this amazing programming language! #JavaScript #coding",
	'Coding may be challenging, but the feeling of accomplishment I get when I complete a project is priceless! #JavaScript #coding',
	'I may not always feel confident as a developer, but I never let that stop me from trying new things and pushing my boundaries! #JavaScript #coding',
	'As a developer, I love using technology to create new and innovative solutions to real-world problems! #JavaScript #coding',
	"There's nothing quite like the feeling of writing a clean, efficient, and elegant piece of code! #JavaScript #coding",

	'The best part of being a JavaScript developer is seeing your code come to life! #JavaScript #development',
	"As a developer, I love being part of a community that's constantly pushing the boundaries of what's possible with technology! #JavaScript #development",
	"Coding can be challenging, but I'm always up for a good challenge! #JavaScript #development",
	"As a JavaScript developer, I'm always looking for ways to make my code more efficient and effective! #JavaScript #development",
	"I'm constantly amazed by the incredible things that can be accomplished with JavaScript! #JavaScript #development",
	'Coding may not always be glamorous, but the feeling of accomplishment when you complete a project is unbeatable! #JavaScript #development',
	'I love the process of building something from scratch and seeing it come to life through code! #JavaScript #development',
	"As a JavaScript developer, I'm always learning new things and staying up-to-date with the latest trends and technologies! #JavaScript #development",
	'Sometimes the best way to learn is to dive headfirst into a project and figure things out as you go! #JavaScript #development',
	"There's something truly satisfying about solving a complex coding problem and knowing that you've created something truly unique and innovative! #JavaScript #development",

	"As a JavaScript developer, I'm convinced that my code has a mind of its own. Sometimes it works, and other times...not so much! #JavaScript #codinghumor",
	'I love coding so much, sometimes I dream in JavaScript! #JavaScript #codinghumor',
	'I may be a JavaScript developer, but sometimes I feel more like a code janitor, constantly cleaning up after my own messes! #JavaScript #codinghumor',
	'As a JavaScript developer, I often feel like a mad scientist, creating new and strange things with code! #JavaScript #codinghumor',
	"Coding is a bit like a puzzle - sometimes you're missing a few pieces, and other times you're pretty sure the picture is upside down! #JavaScript #codinghumor",
	'I like my code like I like my coffee - strong, efficient, and with no errors! #JavaScript #codinghumor',
	"As a JavaScript developer, I spend a lot of time talking to my computer. It's like having a pet that never listens to you! #JavaScript #codinghumor",
	'Debugging is like being a detective, except the clues are all inside your computer and the culprit is usually you! #JavaScript #codinghumor',
	"Sometimes I feel like my code is a work of art, and other times it's more like abstract expressionism! #JavaScript #codinghumor",
	"I love coding, but sometimes I feel like I need a degree in rocket science just to understand what's going on! #JavaScript #codinghumor",

	"As a JavaScript developer, I'm always fascinated by the versatility and power of this language. #JavaScript #coding",
	'One of the things I love most about working with JavaScript is the endless possibilities for creating dynamic and interactive websites and applications. #JavaScript #webdev',
	"Being a JavaScript developer means constantly staying up to date with the latest developments in the field. It's a challenge, but it's also incredibly rewarding. #JavaScript #development",
	"As a JavaScript developer, I'm always looking for ways to streamline my code and make it more efficient. #JavaScript #optimization",
	'One of the most important skills for a JavaScript developer is the ability to troubleshoot and solve problems quickly and effectively. #JavaScript #debugging',
	'I believe that one of the keys to success as a JavaScript developer is to be open-minded and willing to try new things. #JavaScript #innovation',
	"As a JavaScript developer, I'm constantly inspired by the incredible things that can be achieved through coding. #JavaScript #inspiration",
	"It's amazing to see how JavaScript has evolved over the years, from a simple scripting language to a powerful tool for building complex applications. #JavaScript #evolution",
	'As a JavaScript developer, I love exploring the many different libraries and frameworks that are available, and finding the ones that work best for my projects. #JavaScript #libraries',
	'One of the things that makes JavaScript so special is its versatility - you can use it for everything from simple animations to complex machine learning applications. #JavaScript #versatility',

	"As a JavaScript developer, I'm always striving to write clean, readable code that's easy for others to understand and build upon. #JavaScript #bestpractices",
	'One of the most satisfying things about being a JavaScript developer is seeing your code come to life and interact with users in real-time. #JavaScript #userexperience',
	"As a JavaScript developer, I'm constantly learning new techniques and tools to help me work more efficiently and effectively. #JavaScript #learning",
	'JavaScript is an incredibly versatile language that can be used for everything from simple animations to complex data visualizations. #JavaScript #datavisualization',
	"As a JavaScript developer, I'm always thinking about ways to make my code more modular and reusable, which helps save time and increase productivity. #JavaScript #modularity",
	'One of the things that makes JavaScript so powerful is its ability to work seamlessly with other web technologies like HTML and CSS. #JavaScript #webtech',
	"As a JavaScript developer, I'm passionate about creating accessible and inclusive web experiences for all users, regardless of their abilities or backgrounds. #JavaScript #accessibility",
	"JavaScript is an incredibly dynamic and ever-changing language, with new features and updates being released all the time. It's a thrilling time to be a developer! #JavaScript #updates",
	'One of the biggest challenges of working with JavaScript is managing dependencies and ensuring that all libraries and frameworks play nicely together. #JavaScript #dependencymanagement',
	"As a JavaScript developer, I'm always striving to strike a balance between performance and functionality, ensuring that my code is both fast and feature-rich. #JavaScript #performance",
];

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

		(async () => {
			const randomNum = Math.floor(Math.random() * 7); // Generate random number between 0 and 6
			if (randomNum === 6) {
				// Random tweet from GPT prompts array
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
			} else {
				// Random tweet from Tweets array
				await refreshedClient.v2.tweet(
					Tweets[Math.floor(Math.random() * Tweets.length)]
				);
			}
		})();
	});
