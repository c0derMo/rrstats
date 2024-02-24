import { IPermission } from "~/utils/interfaces/IUser";
import { User } from "../model/User";
import { H3Event } from "h3";
import { randomBytes } from "crypto";

interface SessionData {
    discordId?: string;
}

export class AuthController {
    private static sessionKey: string = "";

    static async useSession(event: H3Event) {
        if (AuthController.sessionKey === "") {
            AuthController.sessionKey = randomBytes(32).toString("hex");
        }

        return await useSession<SessionData>(event, {
            password: AuthController.sessionKey,
            name: "rrstats",
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
