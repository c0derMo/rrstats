import { IMatch } from "../interfaces/IMatch";

export function calculateWinrate(matches: IMatch[], player: string): number {
    const filteredMatches = filterForfeitMatches(matches);
    const wins = filteredMatches.filter((m) => {
        return (
            (m.playerOne === player && m.playerOneScore > m.playerTwoScore) ||
            (m.playerTwo === player && m.playerTwoScore > m.playerOneScore)
        );
    }).length;

    const ties = filteredMatches.filter((m) => {
        return m.playerOneScore === m.playerTwoScore;
    }).length;

    return (wins + 0.5 * ties) / filteredMatches.length;
}

export function calculateWTL(
    matches: IMatch[],
    player: string,
): { w: number; t: number; l: number } {
    const filteredMatches = filterForfeitMatches(matches);
    const wins = filteredMatches.filter((m) => {
        return (
            (m.playerOne === player && m.playerOneScore > m.playerTwoScore) ||
            (m.playerTwo === player && m.playerTwoScore > m.playerOneScore)
        );
    }).length;

    const ties = filteredMatches.filter((m) => {
        return m.playerOneScore === m.playerTwoScore;
    }).length;

    const losses = filteredMatches.filter((m) => {
        return (
            (m.playerOne === player && m.playerOneScore < m.playerTwoScore) ||
            (m.playerTwo === player && m.playerTwoScore < m.playerOneScore)
        );
    }).length;

    return { w: wins, t: ties, l: losses };
}

export function debutMatch(matches: IMatch[]): IMatch | undefined {
    const sortedMatches = [...matches].sort(
        (a, b) => a.timestamp - b.timestamp,
    );

    if (sortedMatches.length > 0) {
        return sortedMatches[0];
    } else {
        return undefined;
    }
}
