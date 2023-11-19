export type IUser = {
    username: string;
    discordId: string;

    permissions: IPermission[];
};

export enum IPermission {
    EDIT_COMPETITIONS,
}
