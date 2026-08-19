import { Competition } from "~~/server/model/Competition";
import { Match } from "~~/server/model/Match";
import ld from "lodash";
import { MapLeaderboardStatistic } from "./MapLeaderboardStatistic";

export abstract class SimpleMapLeaderboardStatistic extends MapLeaderboardStatistic<DefaultedMap<HitmanMap, number[]>> {
    private competitionAmount: number;
    private columnName: string;
    private leaderboardName: string;
    private explanatoryText?: string;

    constructor(columnName: string, lbName: string, explanatoryText?: string) {
        super();
        this.competitionAmount = 0;
        this.columnName = columnName;
        this.leaderboardName = lbName;
        this.explanatoryText = explanatoryText;
    }

    basedOn() {
        return ["match" as const, "map" as const, "comp" as const];
    }

    abstract computeMapStats(competitions: ICompetition[], matches: IMatch[]): void;

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
            .select(["match.competition", "map.map", "map.picked", "match.bannedMaps"])
            .getMany();
        this.mapCache = new DefaultedMap(() =>
            Array(officialCompetitions.length).fill(0),
        );

        this.competitionAmount = officialCompetitions.length;

        this.computeMapStats(officialCompetitions, matches);
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

        const result: LeaderboardRow[] = this.mapCache?.mapAll((map, compPicks) => {
            const score = compPicks
                .slice(startingCompetition, endingCompetition + 1)
                .reduce((prev, cur) => prev + cur, 0);

            const preBuilt: LeaderboardRow = {
                columns: {
                    "Map": map,
                },
                value: score,
                order: 0
            };
            preBuilt.columns[this.columnName] = score;
            return preBuilt;

        }) ?? [];

        this.sortAndInferPlacementByValue(result);
        return result;
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: this.leaderboardName,
            category: "map",
            explanatoryText: this.explanatoryText,
            columns: [
                { name: "Placement", type: LeaderboardColumnType.PLACEMENT_TAG },
                { name: "Map", type: LeaderboardColumnType.MAP },
                { name: this.columnName, type: LeaderboardColumnType.TEXT },
                { name: "Competition", type: LeaderboardColumnType.HIDDEN, filterable: LeaderboardFilterType.COMPETITION_RANGE, defaultFilter: [0, -1], serverSideFilter: true }
            ]
        }
    };
}