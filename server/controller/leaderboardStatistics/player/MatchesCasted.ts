import { Match } from "~~/server/model/Match";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class PlayerMatchesCasted extends BaseLeaderboardStatistic {
    basedOn() {
        return ["match" as const];
    };

    async calculate(): Promise<void> {
        const matches = await Match.createQueryBuilder("match")
            .select(["match.shoutcasters"])
            .getMany();
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

        const result: LeaderboardRow[] = matchesCasted.mapAll(
            (caster, matchesCasted) => {
                return {
                    columns: {
                        "Caster": caster,
                        "Matches casted": matchesCasted
                    },
                    value: matchesCasted,
                    order: 0,
                };
            },
        );

        this.sortAndInferPlacementByValue(result);
        this.cache = result;
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Most matches casted",
            category: "player",
            subcategory: "Other",
            columns: [
                { name: "Placement", type: LeaderboardColumnType.PLACEMENT_TAG },
                { name: "Caster", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Matches casted", type: LeaderboardColumnType.TEXT },
            ]
        }
    };
}
