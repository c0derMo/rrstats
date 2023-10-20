import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class RRMatch {
    @PrimaryGeneratedColumn("uuid")
        uuid: string;
    @Column()
        player1: string;
    @Column()
        player2: string;
    @Column("simple-json")
        score: IRRMatchScore;
    @Column()
        competition: string;
    @Column({ nullable: true })
        platform: string;
    @Column()
        round: string;
    @Column("simple-json")
        maps: IRRMap[];
    @Column("simple-json")
        bans: IRRBan[];
    @Column()
        timestamp: number;
    @Column({ nullable: true })
        hitmapsMatchId: string;
}

interface IRRMatchScore {
    player1Points: number;
    player2Points: number;
    winner: number;
}

export interface IRRBan {
    map: string;
    bannedBy: number;
}

export interface IRRMap {
    map: string;
    winner: number;
    pickedBy: number;       // Picked by player
    forfeit?: boolean;
    spin?: ISpin;
}

export interface ISpin {
    mission: {
        slug: string;
        publicIdPrefix: number;
        targets: {
            name: string;
            tileUrl: string;
        }[];
    };
    targetConditions: {
        target: {
            name: string;
            tileUrl: string;
        };
        killMethod: {
            name: string;
            tileUrl: string;
            selectedVariant: string;
        };
        disguise: {
            name: string;
            tileUrl: string;
        };
        complications: {
            name: string;
            tileUrl: string;
        }[];
    }[];
    additionalObjectives: {
        objective: {
            name: string;
            tileUrl: string;
        };
        completionMethod: {
            name: string;
            tileUrl: string;
        };
        disguise: {
            name: string;
            tileUrl: string;
        };
    }[];
}