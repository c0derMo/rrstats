import { ICompetitionPlacement } from "~/utils/interfaces/ICompetition";
import { LeaderboardPlayerStatistic } from "../../LeaderboardController";
import { IMatch } from "~/utils/interfaces/IMatch";
import { IPlayer } from "~/utils/interfaces/IPlayer";
import { LeaderboardPlayerEntry } from "~/utils/interfaces/LeaderboardEntry";

export class PlayerGFAppearances implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Grand Final Appearances";
    hasMaps = false;

    calculate(
        players: IPlayer[],
        matches: IMatch[],
        placements: ICompetitionPlacement[],
    ): LeaderboardPlayerEntry[] {
        const appearances: Record<string, Set<string>> = {};

        for (const placement of placements) {
            if ((placement.placement ?? 0) > 2) continue;
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
