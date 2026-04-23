import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    BeforeInsert,
    BeforeUpdate,
    Index,
} from "typeorm";

@Entity()
export class Player extends BaseEntity implements IPlayer {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Index()
    @Column("text")
    primaryName: string;
    @Column("simple-json")
    alternativeNames: string[];

    @Column("text", { nullable: true })
    discordId?: string | null;
    @Column("text", { nullable: true })
    nationality?: string | null;

    @Column("text")
    defaultAccolade: string;
    @Column("text")
    accolade: string;

    @Index()
    @Column("boolean", { nullable: true })
    excludedFromSearch?: boolean;

    @BeforeInsert()
    @BeforeUpdate()
    checkOptionalFields() {
        if (this.discordId === "") {
            this.discordId = null;
        }
        if (this.nationality === "") {
            this.nationality = null;
        } else {
            this.nationality = this.nationality?.toLowerCase();
        }
    }
}
