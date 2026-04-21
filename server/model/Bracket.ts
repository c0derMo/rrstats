import { BaseEntity, Column, Entity, Index, PrimaryColumn } from "typeorm";

@Entity()
export class Bracket extends BaseEntity implements IBracket {
    @PrimaryColumn("text")
    competition: string;
    @PrimaryColumn("int8")
    index: number;
    
    @Column("text")
    @Index()
    name: string;
    @Column("boolean")
    advancementBracket: boolean;
    @Column("simple-json")
    rounds: IBracketRound[][];
    @Column("simple-json")
    forfeits: Record<string, string>;
}
