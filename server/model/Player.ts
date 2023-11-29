import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    EventSubscriber,
    EntitySubscriberInterface,
    BeforeInsert,
    BeforeUpdate,
} from "typeorm";
import { IPlayer } from "~/utils/interfaces/IPlayer";
import { CompetitionPlacement } from "./Competition";

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

        const placements = await CompetitionPlacement.countBy({
            player: entity.uuid,
        });
        if (placements > 0) {
            entity.accolade = "Returning Rival";
        } else {
            entity.accolade = "Roulette Rookie";
        }
    }
}
