import { Competition } from "~~/server/model/Competition";
import type { LeaderboardMapStatistic } from "../../LeaderboardController";
import { Match } from "~~/server/model/Match";

export class MapBanned implements LeaderboardMapStatistic {
    type = "map" as const;
    name = "Banned";

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
            .select(["match.competition", "match.bannedMaps"])
            .getMany();
        const bannedMap: DefaultedMap<string, number[]> = new DefaultedMap(() =>
            Array(officialCompetitions.length).fill(0),
        );

        for (const match of matches) {
            const compIndex = officialCompetitions.findIndex(
                (comp) => comp.tag === match.competition,
            );
            if (compIndex < 0) {
                continue;
            }

            for (const map of match.bannedMaps) {
                if (map.picked === ChoosingPlayer.RANDOM) continue;

                const mapName = getMap(map.map)!.name;
                bannedMap.get(mapName)[compIndex] += 1;
            }
        }

        const result: LeaderboardMapEntry[] = bannedMap.mapAll(
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
