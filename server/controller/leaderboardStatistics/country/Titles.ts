import { Player } from "~~/server/model/Player";
import MapperService from "../../MapperService";
import { Competition, CompetitionPlacement } from "~~/server/model/Competition";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class CountryTitles extends BaseLeaderboardStatistic {
    basedOn() {
        return ["player" as const, "placement" as const];
    }

    async calculate(): Promise<void> {
        const players = await Player.createQueryBuilder("player")
            .select(["player.uuid", "player.nationality", "player.primaryName"])
            .getMany();
        const placements = await CompetitionPlacement.createQueryBuilder(
            "placement",
        )
            .innerJoin(
                Competition,
                "competition",
                "placement.competition = competition.tag",
            )
            .where("competition.officialCompetition = TRUE")
            .andWhere("placement.placement = 1")
            .select(["placement.player"])
            .getMany();
        const countryMap = MapperService.createStringMapFromList(
            players,
            "uuid",
            "nationality",
        );
        const nameMap = MapperService.createStringMapFromList(
            players,
            "uuid",
            "primaryName",
        );

        const titlesPerCountry: DefaultedMap<
            string,
            DefaultedMap<string, number>
        > = new DefaultedMap(() => new DefaultedMap(() => 0));
        for (const placement of placements) {
            // if (placement.placement !== 1) continue;
            const nationality = countryMap[placement.player];
            if (nationality != null) {
                const countryMap = titlesPerCountry.get(nationality);
                countryMap.set(
                    placement.player,
                    countryMap.get(placement.player) + 1,
                );
            }
        }

        const result: LeaderboardRow[] = titlesPerCountry.mapAll(
            (country, players) => {
                const sum = getSumOfValues(players);
                return {
                    columns: {
                        Flag: `https://flagicons.lipis.dev/flags/4x3/${country}.svg`,
                        Country: this.getCountryName(country),
                        Titles: sum,
                    },
                    value: sum,
                    order: 0,
                    expandableRows: players
                        .mapAll((key, value) => {
                            return { player: key, score: value };
                        })
                        .toSorted((a, b) => b.score - a.score)
                        .map((player) => [
                            nameMap[player.player] ?? player.player,
                            player.score.toString(),
                        ]),
                };
            },
        );
        this.sortAndInferPlacementByValue(result);
        this.cache = result;
    }

    private getCountryName(code: string) {
        return (
            new Intl.DisplayNames(["en"], { type: "region" }).of(
                code.toUpperCase(),
            ) ?? `Unknown country: ${code}`
        );
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Most titles per country",
            category: "country",
            columns: [
                {
                    name: "Placement",
                    type: LeaderboardColumnType.PLACEMENT_TAG,
                },
                { name: "Flag", type: LeaderboardColumnType.IMAGE },
                {
                    name: "Country",
                    type: LeaderboardColumnType.TEXT,
                    searchable: true,
                },
                { name: "Titles", type: LeaderboardColumnType.TEXT },
            ],
        };
    }
}
