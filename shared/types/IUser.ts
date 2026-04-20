export type IUser = {
    username: string;
    authorizationKey: string;
    isAPIKey: boolean;
    permissions: IPermission[];
};

export enum IPermission {
    BACKEND_ACCESS = "backend_access",
    EDIT_COMPETITIONS = "edit_comp",
    EDIT_PLAYERS = "edit_players",
    EDIT_MATCHES = "edit_matches",
    EDIT_RECORDS = "edit_records",
    EDIT_USERS = "edit_users",
    EDIT_ACHIEVEMENTS = "edit_achievements",
}
