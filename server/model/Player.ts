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
    title?: string | null;
    @Column("boolean", { nullable: true })
    hasCustomTitle?: boolean;

    @Index()
    @Column("boolean", { nullable: true })
    excludedFromSearch?: boolean;

    accolade: string;

    @BeforeInsert()
    @BeforeUpdate()
    checkOptionalFields() {
        if (this.discordId === "") {
            this.discordId = null;
        }
        if (this.title === "") {
            this.title = null;
        }
        if (this.nationality === "") {
            this.nationality = null;
        } else {
            this.nationality = this.nationality?.toLowerCase();
        }
    }
}

@EventSubscriber()
export class PlayerAccoladeSubscriber
    implements EntitySubscriberInterface<Player>
{
    listenTo() {
        return Player;
    }

    async afterLoad(entity: Player): Promise<void> {
        if (entity.title != null) {
            entity.accolade = entity.title;
            return;
        }

        const officialCompetitions = await Competition.find({
            select: ["tag"],
            where: { officialCompetition: true },
        });

        const placements = await CompetitionPlacement.countBy({
            player: entity.uuid,
            competition: In(officialCompetitions.map((c) => c.tag)),
        });
        if (placements > 0) {
            entity.accolade = "Returning Rival";
        } else {
            entity.accolade = "Roulette Rookie";
        }
    }
}
