import { Player } from "~~/server/model/Player";
import MapperService from "../../MapperService";
import { Match } from "~~/server/model/Match";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class CountryMatches extends BaseLeaderboardStatistic {
    basedOn() {
        return ["player" as const, "match" as const];
    }

    async calculate(): Promise<void> {
        const players = await Player.createQueryBuilder("player")
            .select(["player.uuid", "player.nationality", "player.primaryName"])
            .getMany();
        const matches = await Match.createQueryBuilder("match")
            .select(["match.playerOne", "match.playerTwo"])
            .getMany();

        const countryMap = MapperService.createStringMapFromList(
            players,
            "uuid",
            "nationality",
        );
        const nameMap = MapperService.createStringMapFromList(
            players,
            "uuid",
            "primaryName"
        );

        const matchesPerCountry: DefaultedMap<
            string,
            DefaultedMap<string, number>
        > = new DefaultedMap(() => new DefaultedMap(() => 0));
        for (const match of matches) {
            const nationalityOne = countryMap[match.playerOne];
            const nationalityTwo = countryMap[match.playerTwo];

            if (nationalityOne != null) {
                const countryOneMap = matchesPerCountry.get(nationalityOne);
                countryOneMap.set(
                    match.playerOne,
                    countryOneMap.get(match.playerOne) + 1,
                );
            }
            if (nationalityTwo != null && nationalityOne !== nationalityTwo) {
                const countryTwoMap = matchesPerCountry.get(nationalityTwo);
                countryTwoMap.set(
                    match.playerTwo,
                    countryTwoMap.get(match.playerTwo) + 1,
                );
            }
        }

        const result: LeaderboardRow[] = matchesPerCountry.mapAll(
            (country, players) => {
                const sum = getSumOfValues(players);
                return {
                    columns: {
                        "Flag": `https://flagicons.lipis.dev/flags/4x3/${country}.svg`,
                        "Country": this.getCountryName(country),
                        "Matches": sum
                    },
                    value: sum,
                    order: 0,
                    expandableRows: players.mapAll((player, matches) => {
                            return { player, matches }
                        })
                        .toSorted((a, b) => b.matches - a.matches)
                        .map((player) => [nameMap[player.player] ?? player.player, player.matches.toString()])
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
            name: "Matches per country",
            category: "country",
            columns: [
                { name: "Placement", type: LeaderboardColumnType.PLACEMENT_TAG },
                { name: "Flag", type: LeaderboardColumnType.IMAGE },
                { name: "Country", type: LeaderboardColumnType.TEXT, searchable: true },
                { name: "Matches", type: LeaderboardColumnType.TEXT },
            ],
        }
    }
}
