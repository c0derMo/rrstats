import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";
import type { IPermission, IUser } from "~/utils/interfaces/IUser";

@Entity()
export class User extends BaseEntity implements IUser {
    @PrimaryColumn("text")
    authorizationKey: string;
    @Column("text")
    username: string;
    @Column("boolean")
    isAPIKey: boolean;
    @Column("simple-json")
    permissions: IPermission[];
}
