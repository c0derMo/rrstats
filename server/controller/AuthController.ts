import type { IPermission } from "~/utils/interfaces/IUser";
import { User } from "../model/User";
import type { H3Event } from "h3";
import { randomBytes } from "crypto";
import consola from "consola";

interface SessionData {
    discordId?: string;
}

const logger = consola.withTag("rrstats:auth");

export class AuthController {
    private static sessionKey: string = "";

    static async useSession(event: H3Event) {
        if (AuthController.sessionKey === "") {
            if (import.meta.dev) {
                logger.log(
                    "Dev Environment detected, using static session key",
                );
                AuthController.sessionKey =
                    "static_dev_token_thats_a_bit_longer_to_have_32_characters";
            } else {
                AuthController.sessionKey = randomBytes(32).toString("hex");
            }
        }

        return await useSession<SessionData>(event, {
            password: AuthController.sessionKey,
            name: "rrstats",
            cookie: {
                sameSite: false,
            },
        });
    }

    static async isAuthenticated(
        discordId?: string,
        permission?: IPermission,
    ): Promise<boolean> {
        if (discordId == null) {
            return false;
        }

        const user = await User.findOneBy({
            authorizationKey: discordId,
            isAPIKey: false,
        });
        if (user == null) {
            return false;
        }

        if (permission == null) {
            return true;
        }

        return user.permissions.includes(permission);
    }

    static async isValidAPIKey(
        apiKey?: string,
        permission?: IPermission,
    ): Promise<boolean> {
        if (apiKey == null) {
            return false;
        }

        const key = await User.findOneBy({
            authorizationKey: apiKey,
            isAPIKey: true,
        });
        if (key == null) {
            return false;
        }

        if (permission == null) {
            return true;
        }
        return key.permissions.includes(permission);
    }
}
