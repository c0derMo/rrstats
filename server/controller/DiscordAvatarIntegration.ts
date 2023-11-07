import axios from "axios";

interface DiscordCacheEntry {
    lastRequest: number;
    avatarLink: string;
}
interface DiscordResponse {
    retry_after?: number;
    avatar?: string;
}

export default class DiscordAvatarIntegration {

    private static cache: Record<string, DiscordCacheEntry> = {};
    private static retryIn: number = 0;
    
    private static DEFAULT_AVATAR = "/defaultPB.png";
    private static RUNTIME_CONFIG = useRuntimeConfig();
    private static DISCORD_TOKEN = this.RUNTIME_CONFIG.discordToken;

    static async getProfilePicture(discordId?: string): Promise<string> {
        if (discordId === undefined || discordId === "" || this.DISCORD_TOKEN === "") {
            return this.DEFAULT_AVATAR;
        }

        if (Date.now() < this.retryIn) {
            // We apparently hit a 429 recently
            return this.DEFAULT_AVATAR;
        }
        if (this.cache[discordId] !== undefined) {
            if (Date.now() - this.cache[discordId].lastRequest < 900000) {
                // Cache isn't too old
                return this.cache[discordId].avatarLink;
            }
        }

        // We need to query
        const request = await axios.get<DiscordResponse>(`https://discord.com/api/v9/users/${discordId}`, { headers: { "Authorization": `Bot ${this.DISCORD_TOKEN}` }, validateStatus: () => true });
        if (request.status === 429) {
            console.log("WARN: Discord request hit 429");
            this.retryIn = Date.now() + (request.data.retry_after! * 1000);
            return this.DEFAULT_AVATAR;
        } else if (request.status !== 200) {
            return this.DEFAULT_AVATAR;
        } else if (request.data.avatar === undefined || request.data.avatar === null) {
            this.cache[discordId] = {
                avatarLink: this.DEFAULT_AVATAR,
                lastRequest: Date.now()
            };
        } else {
            this.cache[discordId] = {
                avatarLink: `https://cdn.discordapp.com/avatars/${discordId}/${request.data.avatar}.png`,
                lastRequest: Date.now()
            };
        }

        return this.cache[discordId].avatarLink;
    }

}