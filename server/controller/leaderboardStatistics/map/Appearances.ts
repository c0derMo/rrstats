import {
    ICompetition,
    ICompetitionPlacement,
} from "~/utils/interfaces/ICompetition";
import { LeaderboardMapStatistic } from "../../LeaderboardController";
import { IMatch } from "~/utils/interfaces/IMatch";
import { IPlayer } from "~/utils/interfaces/IPlayer";
import { LeaderboardMapEntry } from "~/utils/interfaces/LeaderboardEntry";
import { DefaultedMap } from "~/utils/DefaultedMap";
import { getMap } from "~/utils/mapUtils";
import { filterForfeitMatches } from "~/utils/matchUtils";

export class MapAppearance implements LeaderboardMapStatistic {
    type = "map" as const;
    name = "Appearances";
    explanatoryText =
        "Total of map picked, map banned & map played as random map";

    calculate(
        players: IPlayer[],
        matches: IMatch[],
        placements: ICompetitionPlacement[],
        officialCompetitions: ICompetition[],
    ): LeaderboardMapEntry[] {
        const appearanceMap: DefaultedMap<number[]> = new DefaultedMap(() =>
            Array(officialCompetitions.length).fill(0),
        );

        for (const match of filterForfeitMatches(matches)) {
            const compIndex = officialCompetitions.findIndex(
                (comp) => comp.tag === match.competition,
            );
            if (compIndex < 0) {
                continue;
            }

            for (const map of match.playedMaps) {
                const mapName = getMap(map.map)!.name;
                appearanceMap.get(mapName)[compIndex] += 1;
            }
            for (const map of match.bannedMaps) {
                const mapName = getMap(map.map)!.name;
                appearanceMap.get(mapName)[compIndex] += 1;
            }
        }

        const result: LeaderboardMapEntry[] = appearanceMap.mapAll(
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
