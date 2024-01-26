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
}
