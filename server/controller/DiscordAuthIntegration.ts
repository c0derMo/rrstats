import { User } from "../model/User";

interface DiscordUser {
    id: string;
    username: string;
    discriminator: string;
    global_name?: string;
    avatar?: string;
    bot?: boolean;
    system?: boolean;
    mfa_enabled?: boolean;
    banner?: string;
    accent_color?: number;
    locale?: string;
    flags?: number;
    premium_type?: number;
    public_flags?: number;
    avatar_decoration?: string;
}

export default class DiscordAuthIntegration {
    private static RUNTIME_CONFIG = useRuntimeConfig();
    private static DISCORD_ID = this.RUNTIME_CONFIG.discordId;
    private static DISCORD_SECRET = this.RUNTIME_CONFIG.discordSecret;
    private static PUBLIC_ORIGIN = this.RUNTIME_CONFIG.publicOrigin;

    private static getRedirectURI(): string {
        return encodeURIComponent(
            `${this.PUBLIC_ORIGIN}/api/auth/discord_callback`,
        );
    }

    static getLoginURI(sessionId: string): string {
        return (
            `https://discord.com/api/oauth2/authorize` +
            `?response_type=code` +
            `&client_id=${this.DISCORD_ID}` +
            `&scope=identify` +
            `&state=${sessionId}` +
            `&redirect_uri=${this.getRedirectURI()}`
        );
    }

    static async handleLogin(
        sessionId: string,
        discordCallbackCode: string,
        discordState: string,
    ): Promise<User | null> {
        if (sessionId !== discordState) {
            throw new Error("State and session don't align");
        }

        const data =
            `client_id=${this.DISCORD_ID}` +
            `&client_secret=${this.DISCORD_SECRET}` +
            `&grant_type=authorization_code` +
            `&code=${discordCallbackCode}` +
            `&redirect_uri=${this.getRedirectURI()}`;

        let token: string;
        try {
            const tokenRequest = await $fetch<{ access_token: string }>(
                "https://discord.com/api/oauth2/token",
                {
                    method: "POST",
                    body: data,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                },
            );
            token = tokenRequest.access_token;
        } catch (e) {
            console.log(e);
            console.log((e as { data: string }).data);
            throw new Error("Error in token request");
        }

        let discordId: string;
        try {
            const userReqeust = await $fetch<DiscordUser>(
                "https://discord.com/api/v10/users/@me",
                { headers: { Authorization: `Bearer ${token}` } },
            );
            discordId = userReqeust.id;
        } catch (e) {
            console.log(e);
            console.log((e as { data: string }).data);
            throw new Error("Error in user request");
        }

        const user = await User.findOneBy({ authorizationKey: discordId, isAPIKey: false });

        return user;
    }
}
