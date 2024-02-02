import { IPermission } from "~/utils/interfaces/IUser";
import { User } from "../model/User";

export class AuthController {
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
