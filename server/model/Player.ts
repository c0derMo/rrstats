import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";
import { IPlayer } from "~/utils/interfaces/IPlayer";

@Entity()
export class Player extends BaseEntity implements IPlayer {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column('text')
    primaryName: string;
    @Column('simple-json')
    alternativeNames: string[];

    @Column('text', { nullable: true })
    discordId?: string;

    @Column('text', { nullable: true })
    title?: string;
    @Column('boolean', { nullable: true })
    hasCustomTitle?: boolean;

    @Column('boolean', { nullable: true })
    excludedFromSearch?: boolean;
}