import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    EventSubscriber,
    type EntitySubscriberInterface,
    BeforeInsert,
    BeforeUpdate,
    In,
    Index,
} from "typeorm";
import { Competition, CompetitionPlacement } from "./Competition";

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

    @Column("text", { nullable: true })
    defaultAccolade: string;
    @Column("text", { nullable: true })
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

@EventSubscriber()
export class PlayerAccoladeSubscriber implements EntitySubscriberInterface<Player> {
    listenTo() {
        return Player;
    }

    async afterLoad(entity: Player): Promise<void> {
        if (entity.defaultAccolade == null || entity.defaultAccolade === "") {
            const officialCompetitions = await Competition.find({
                select: ["tag"],
                where: { officialCompetition: true },
            });

            const placements = await CompetitionPlacement.countBy({
                player: entity.uuid,
                competition: In(officialCompetitions.map((c) => c.tag)),
            });
            if (placements > 0) {
                entity.defaultAccolade = "Returning Rival";
            } else {
                entity.defaultAccolade = "Roulette Rookie";
            }
        }
        if (entity.accolade == null || entity.accolade === "") {
            entity.accolade = entity.defaultAccolade;
        }
    }
}
