import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    EventSubscriber,
    EntitySubscriberInterface,
    BeforeInsert,
    BeforeUpdate,
    In,
} from "typeorm";
import { IPlayer } from "~/utils/interfaces/IPlayer";
import { Competition, CompetitionPlacement } from "./Competition";

@Entity()
export class Player extends BaseEntity implements IPlayer {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column("text")
    primaryName: string;
    @Column("simple-json")
    alternativeNames: string[];

    @Column("text", { nullable: true })
    discordId?: string;

    @Column("text", { nullable: true })
    title?: string;
    @Column("boolean", { nullable: true })
    hasCustomTitle?: boolean;

    @Column("boolean", { nullable: true })
    excludedFromSearch?: boolean;

    accolade: string;

    @BeforeInsert()
    @BeforeUpdate()
    checkOptionalFields() {
        if (this.discordId === "") {
            this.discordId = undefined;
        }
        if (this.title === "") {
            this.title = undefined;
        }
    }
}

@EventSubscriber()
export class PlayerSubscriber implements EntitySubscriberInterface<Player> {
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
