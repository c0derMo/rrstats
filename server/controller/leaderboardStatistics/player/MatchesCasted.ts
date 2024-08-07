import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";
import type { IMatch } from "~/utils/interfaces/IMatch";
import type { IPlayer } from "~/utils/interfaces/IPlayer";
import type { LeaderboardPlayerEntry } from "~/utils/interfaces/LeaderboardEntry";
import { DefaultedMap } from "~/utils/DefaultedMap";

export class PlayerMatchesCasted implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Matches casted";
    hasMaps = false;

    calculate(players: IPlayer[], matches: IMatch[]): LeaderboardPlayerEntry[] {
        const matchesCasted: DefaultedMap<string, number> = new DefaultedMap(
            () => 0,
        );

        for (const match of matches) {
            if (match.shoutcasters == null || match.shoutcasters.length <= 0)
                continue;

            for (const caster of match.shoutcasters) {
                matchesCasted.set(caster, matchesCasted.get(caster) + 1);
            }
        }

        const result: LeaderboardPlayerEntry[] = matchesCasted.mapAll(
            (caster, matchesCasted) => {
                return {
                    player: caster,
                    displayScore: matchesCasted.toString(),
                    sortingScore: matchesCasted,
                };
            },
        );
        result.sort((a, b) => b.sortingScore - a.sortingScore);

        return result;
    }
}
