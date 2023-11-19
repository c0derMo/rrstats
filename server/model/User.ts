import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";
import { IPermission, IUser } from "~/utils/interfaces/IUser";

@Entity()
export class User extends BaseEntity implements IUser {
    @PrimaryColumn("text")
    discordId: string;
    @Column("text")
    username: string;

    @Column("simple-json")
    permissions: IPermission[];
}
