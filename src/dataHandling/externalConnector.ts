import TwitterAPI from 'twitter-api-v2'
import {newEntry} from "../models/AuditLogEntry";
import { config } from 'dotenv';
config();

export async function tweet(tweets: string[], username: string): Promise<object> {
    let lastTweetId = "";

    const twitterClient = new TwitterAPI({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_TOKEN_SECRET
    });

    for(const tweet of tweets) {
        if(lastTweetId === "") {
            const response = await twitterClient.v2.tweet(tweet);
            lastTweetId = response.data.id;
        } else {
            const response = await twitterClient.v2.reply(tweet, lastTweetId);
            lastTweetId = response.data.id;
        }
    }

    await newEntry(username, "Tweeted " + tweets.length.toString() + " messages", {tweets: tweets});
    return {success: true}
}
