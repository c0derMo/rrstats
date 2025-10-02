import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";

export class PlayerRRWCAppearances implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "RRWC Participations";
    hasMaps = false;

    calculate(
        players: IPlayer[],
        matches: IMatch[],
        placements: ICompetitionPlacement[],
    ): LeaderboardPlayerEntry[] {
        const appearances: Record<string, Set<string>> = {};

        for (const placement of placements) {
            if (!placement.competition.toLowerCase().includes("wc")) continue;
            if (appearances[placement.player] == null)
                appearances[placement.player] = new Set();
            appearances[placement.player].add(placement.competition);
        }

        const result: LeaderboardPlayerEntry[] = [];
        for (const player in appearances) {
            result.push({
                player: player,
                displayScore: appearances[player].size.toString(),
                sortingScore: appearances[player].size,
            });
        }
        result.sort((a, b) => b.sortingScore - a.sortingScore);

        return result;
    }
}
