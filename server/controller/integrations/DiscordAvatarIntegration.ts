import type { FetchError } from "ofetch";
import consola from "consola";

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
        if (
            discordId === undefined ||
            discordId === "" ||
            this.DISCORD_TOKEN === ""
        ) {
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
        let request: DiscordResponse;
        try {
            request = await $fetch<DiscordResponse>(
                `https://discord.com/api/v9/users/${discordId}`,
                {
                    headers: { Authorization: `Bot ${this.DISCORD_TOKEN}` },
                    retry: 0,
                },
            );
        } catch (e) {
            const fetchError = e as FetchError;
            if (fetchError.statusCode === 429) {
                consola
                    .withTag("rrstats:discord")
                    .warn("Discord request hit 429");
                this.retryIn = Date.now() + fetchError.data.retry_after! * 1000;
            }
            return this.DEFAULT_AVATAR;
        }

        if (request.avatar == null) {
            this.cache[discordId] = {
                avatarLink: this.DEFAULT_AVATAR,
                lastRequest: Date.now(),
            };
        } else {
            this.cache[discordId] = {
                avatarLink: `https://cdn.discordapp.com/avatars/${discordId}/${request.avatar}.png`,
                lastRequest: Date.now(),
            };
        }

        return this.cache[discordId].avatarLink;
    }
}
