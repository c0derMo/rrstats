export type IUser = {
    username: string;
    authorizationKey: string;
    isAPIKey: boolean;
    permissions: IPermission[];
};

export enum IPermission {
    EDIT_COMPETITIONS,
    EDIT_PLAYERS,
    EDIT_MATCHES,
    EDIT_RECORDS,
    EDIT_USERS,
}
