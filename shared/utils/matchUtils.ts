import type { IMatch } from "../types/IMatch";

export function filterForfeitMatches(matches: IMatch[]): IMatch[] {
    return matches.filter((match) => {
        return match.playerOneScore + match.playerTwoScore > 1;
    });
}
