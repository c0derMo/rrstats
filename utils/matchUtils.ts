import { IMatch } from "./interfaces/IMatch";

export function filterForfeitMatches(matches: IMatch[]): IMatch[] {
    return matches.filter((match) => {
        return match.playerOneScore + match.playerTwoScore > 1;
    });
}
