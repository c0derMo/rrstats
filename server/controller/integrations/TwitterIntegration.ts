import { TwitterApi } from "twitter-api-v2";

export default class TwitterIntegration {
    private static RUNTIME_CONFIG = useRuntimeConfig();
    private static TWITTER_API_KEY = this.RUNTIME_CONFIG.twitterApiKey;
    private static TWITTER_API_SECRET = this.RUNTIME_CONFIG.twitterApiSecret;
    private static TWITTER_ACCESS_TOKEN =
        this.RUNTIME_CONFIG.twitterAccessToken;
    private static TWITTER_ACCESS_SECRET =
        this.RUNTIME_CONFIG.twitterTokenSecret;

    static async tweet(tweets: string[]): Promise<void> {
        let lastTweetId = "";

        if (
            this.TWITTER_API_KEY === "" ||
            this.TWITTER_API_SECRET === "" ||
            this.TWITTER_ACCESS_TOKEN === "" ||
            this.TWITTER_ACCESS_SECRET === ""
        ) {
            throw new Error("Tweeting not enabled");
        }

        const twitterClient = new TwitterApi({
            appKey: this.TWITTER_API_KEY,
            appSecret: this.TWITTER_API_SECRET,
            accessToken: this.TWITTER_ACCESS_TOKEN,
            accessSecret: this.TWITTER_ACCESS_SECRET,
        });

        for (const tweet of tweets) {
            if (lastTweetId === "") {
                const response = await twitterClient.v2.tweet(tweet);
                lastTweetId = response.data.id;
            } else {
                const response = await twitterClient.v2.reply(
                    tweet,
                    lastTweetId,
                );
                lastTweetId = response.data.id;
            }
        }
    }
}
