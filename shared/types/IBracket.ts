export interface IBracketMatch {
    id: string;
    playerOne?: string;
    playerTwo?: string;
    playerOneFrom?: { matchId: string; winner: boolean };
    playerTwoFrom?: { matchId: string; winner: boolean };
    bye?: boolean;
}

export interface IBracketRound {
    roundName: string;
    matches: IBracketMatch[];
}

export interface IBracket {
    name: string;
    index: number;
    advancementBracket: boolean;

    rounds: IBracketRound[][];
    forfeits: Record<string, string>;
}
