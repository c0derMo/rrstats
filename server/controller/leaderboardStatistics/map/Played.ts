import { Competition } from "~~/server/model/Competition";
import { Match } from "~~/server/model/Match";
import ld from "lodash";
import { MapLeaderboardStatistic } from "./MapLeaderboardStatistic";

export class MapPlayed extends MapLeaderboardStatistic<DefaultedMap<HitmanMap, number[]>> {
    private competitionAmount: number;

    constructor() {
        super();
        this.competitionAmount = 0;
    }

    basedOn() {
        return ["match" as const, "map" as const, "comp" as const];
    }

    async calculate(): Promise<void> {
        const officialCompetitions = await Competition.createQueryBuilder(
            "competition",
        )
            .where("competition.officialCompetition = TRUE")
            .select(["competition.tag"])
            .orderBy("competition.startingTimestamp", "ASC")
            .getMany();
        const matches = await Match.createQueryBuilder("match")
            .innerJoin("match.playedMaps", "map")
            .select(["match.competition", "map.map"])
            .getMany();
        this.mapCache = new DefaultedMap(() =>
            Array(officialCompetitions.length).fill(0),
        );

        this.competitionAmount = officialCompetitions.length;
        console.log(officialCompetitions.map((comp) => comp.tag));

        for (const match of matches) {
            const compIndex = officialCompetitions.findIndex(
                (comp) => comp.tag === match.competition,
            );
            if (compIndex < 0) {
                continue;
            }

            for (const map of match.playedMaps) {
                this.mapCache.get(map.map)[compIndex] += 1;
            }
        }
    }

    buildRows(filter?: Record<string, unknown>): LeaderboardRow[] {
        if (filter == null || filter["Competition"] == null || !ld.isArray(filter["Competition"]) || filter["Competition"].length !== 2) {
            return [];
        }

        const startingCompetition = filter["Competition"][0];
        let endingCompetition = filter["Competition"][1];
        if (endingCompetition < 0) {
            endingCompetition = this.competitionAmount + endingCompetition;
        }
        console.log(`Building for ${startingCompetition} to ${endingCompetition}`);

        const result: LeaderboardRow[] = this.mapCache?.mapAll((map, compPicks) => {
            const score = compPicks
                .slice(startingCompetition, endingCompetition + 1)
                .reduce((prev, cur) => prev + cur, 0);
            return {
                columns: {
                    "Map": map,
                    "Played": score
                },
                value: score,
                order: 0
            }
        }) ?? [];
        this.sortAndInferPlacementByValue(result);

        return result;
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Played",
            category: "map",
            columns: [
                { name: "Placement", type: LeaderboardColumnType.PLACEMENT_TAG },
                { name: "Map", type: LeaderboardColumnType.MAP },
                { name: "Played", type: LeaderboardColumnType.TEXT },
                { name: "Competition", type: LeaderboardColumnType.HIDDEN, filterable: LeaderboardFilterType.COMPETITION_RANGE, defaultFilter: [0, -1], serverSideFilter: true }
            ]
        }
    };
}
