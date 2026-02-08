export enum BracketType {
    SINGLE_ELIM = "single_elim",
    DOUBLE_ELIM = "double_elim",
    UNORDERED = "unordered",
}

export interface IBracketMatch {
    id: number;
    playerOne?: string;
    playerTwo?: string;
    winnerTo?: number;
    loserTo?: number;
    bye?: boolean;
}

export interface IBracketRound {
    roundName: string;
    matches: IBracketMatch[];
}

export interface IBracket {
    name: string;
    index: number;
    type: BracketType;

    rounds: IBracketRound[];
}
