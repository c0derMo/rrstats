import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class RRPlayer {
    @PrimaryGeneratedColumn("uuid")
        uuid: string;
    @Column()
        name: string;
    @Column({ nullable: true })
        discordId: string;
    @Column({ nullable: true })
        title: string;
    @Column({ nullable: true })
        customTitle: boolean;
    @Column({ nullable: true })
        excludedFromSearch: boolean;
    @Column({ nullable: true })
        abbreviationOverride: string;
}