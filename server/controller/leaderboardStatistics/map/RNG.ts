import type {
    ICompetition,
    ICompetitionPlacement,
} from "~/utils/interfaces/ICompetition";
import type { LeaderboardMapStatistic } from "../../LeaderboardController";
import { ChoosingPlayer, type IMatch } from "~/utils/interfaces/IMatch";
import type { IPlayer } from "~/utils/interfaces/IPlayer";
import type { LeaderboardMapEntry } from "~/utils/interfaces/LeaderboardEntry";
import { DefaultedMap } from "~/utils/DefaultedMap";
import { getMap } from "~/utils/mapUtils";

export class MapRNG implements LeaderboardMapStatistic {
    type = "map" as const;
    name = "Played as random map";

    calculate(
        players: IPlayer[],
        matches: IMatch[],
        placements: ICompetitionPlacement[],
        officialCompetitions: ICompetition[],
    ): LeaderboardMapEntry[] {
        const randomMap: DefaultedMap<string, number[]> = new DefaultedMap(() =>
            Array(officialCompetitions.length).fill(0),
        );

        for (const match of matches) {
            const compIndex = officialCompetitions.findIndex(
                (comp) => comp.tag === match.competition,
            );
            if (compIndex < 0) {
                continue;
            }

            for (const map of match.playedMaps) {
                if (map.picked !== ChoosingPlayer.RANDOM) continue;

                const mapName = getMap(map.map)!.name;
                randomMap.get(mapName)[compIndex] += 1;
            }
        }

        const result: LeaderboardMapEntry[] = randomMap.mapAll(
            (map, compPicks) => {
                return {
                    map: map,
                    sortingScore: compPicks.reduce(
                        (prev, cur) => prev + cur,
                        0,
                    ),
                    tournamentBreakdown: compPicks,
                };
            },
        );
        result.sort((a, b) => b.sortingScore - a.sortingScore);

        return result;
    }
}
