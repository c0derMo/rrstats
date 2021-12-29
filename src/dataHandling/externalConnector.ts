import TwitterAPI from 'twitter-api-v2'
import {AuditLogModel} from "../models/AuditLogEntry";
require('dotenv').config();

export async function tweet(tweets: string[], username: string): Promise<object> {
    let lastTweetId = "";

    let twitterClient = new TwitterAPI({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_TOKEN_SECRET
    });

    for(let tweet of tweets) {
        if(lastTweetId === "") {
            let response = await twitterClient.v2.tweet(tweet);
            lastTweetId = response.data.id;
        } else {
            let response = await twitterClient.v2.reply(tweet, lastTweetId);
            lastTweetId = response.data.id;
        }
    }

    await AuditLogModel.newEntry(username, "Tweeted" + tweets.length + " messages", {tweets: tweets});
    return {success: true}
}