import {
    ICompetition,
    ICompetitionPlacement,
} from "~/utils/interfaces/ICompetition";
import { LeaderboardMapStatistic } from "../../LeaderboardController";
import { ChoosingPlayer, IMatch } from "~/utils/interfaces/IMatch";
import { IPlayer } from "~/utils/interfaces/IPlayer";
import { LeaderboardMapEntry } from "~/utils/interfaces/LeaderboardEntry";
import { DefaultedMap } from "~/utils/DefaultedMap";
import { getMap } from "~/utils/mapUtils";

export class MapPicked implements LeaderboardMapStatistic {
    type = "map" as const;
    name = "Picked";

    calculate(
        players: IPlayer[],
        matches: IMatch[],
        placements: ICompetitionPlacement[],
        officialCompetitions: ICompetition[],
    ): LeaderboardMapEntry[] {
        const pickedMap: DefaultedMap<number[]> = new DefaultedMap(() =>
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
                if (map.picked === ChoosingPlayer.RANDOM) continue;

                const mapName = getMap(map.map)!.name;
                pickedMap.get(mapName)[compIndex] += 1;
            }
        }

        const result: LeaderboardMapEntry[] = pickedMap.mapAll(
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
