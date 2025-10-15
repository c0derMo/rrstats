import { Competition } from "~~/server/model/Competition";
import type { LeaderboardMapStatistic } from "../../LeaderboardController";
import { Match } from "~~/server/model/Match";

export class MapAppearance implements LeaderboardMapStatistic {
    type = "map" as const;
    name = "Appearances";
    explanatoryText =
        "Total of map picked, map banned & map played as random map";

    basedOn = ["match" as const, "map" as const, "comp" as const];

    async calculate(): Promise<LeaderboardMapEntry[]> {
        const officialCompetitions = await Competition.createQueryBuilder(
            "competition",
        )
            .where("competition.officialCompetition = TRUE")
            .select(["competition.tag"])
            .orderBy("competition.startingTimestamp", "DESC")
            .getMany();
        const matches = await Match.createQueryBuilder("match")
            .innerJoin("match.playedMaps", "map")
            .select(["match.competition", "match.bannedMaps", "map.map"])
            .getMany();
        const appearanceMap: DefaultedMap<string, number[]> = new DefaultedMap(
            () => Array(officialCompetitions.length).fill(0),
        );

        for (const match of matches) {
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
