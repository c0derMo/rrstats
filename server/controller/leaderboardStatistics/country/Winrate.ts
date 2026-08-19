import { Player } from "~~/server/model/Player";
import MapperService from "../../MapperService";
import { Match } from "~~/server/model/Match";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class CountryWinrate extends BaseLeaderboardStatistic {
    basedOn() {
        return ["player" as const, "match" as const];
    }

    async calculate(): Promise<void> {
        const players = await Player.createQueryBuilder("player")
            .select(["player.uuid", "player.nationality", "player.primaryName"])
            .getMany();
        const matches = await Match.createQueryBuilder("match")
            .select([
                "match.playerOne",
                "match.playerTwo",
                "match.playerOneScore",
                "match.playerTwoScore",
            ])
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

        const winratePerCountry: DefaultedMap<
            string,
            DefaultedMap<string, { wins: number; matches: number }>
        > = new DefaultedMap(
            () =>
                new DefaultedMap(() => {
                    return { wins: 0, matches: 0 };
                }),
        );
        const sameCountryMatchups: DefaultedMap<string, number> =
            new DefaultedMap(() => 0);
        for (const match of filterForfeitMatches(matches)) {
            const nationalityOne = countryMap[match.playerOne];
            const nationalityTwo = countryMap[match.playerTwo];

            this.increaseIfNotNull(
                winratePerCountry,
                nationalityOne,
                match.playerOne,
                "matches",
                1,
            );
            this.increaseIfNotNull(
                winratePerCountry,
                nationalityTwo,
                match.playerTwo,
                "matches",
                1,
            );
            if (nationalityOne === nationalityTwo && nationalityOne != null) {
                sameCountryMatchups.set(
                    nationalityOne,
                    sameCountryMatchups.get(nationalityOne) + 1,
                );
            }

            if (match.playerOneScore > match.playerTwoScore) {
                this.increaseIfNotNull(
                    winratePerCountry,
                    nationalityOne,
                    match.playerOne,
                    "wins",
                    1,
                );
            } else if (match.playerTwoScore > match.playerOneScore) {
                this.increaseIfNotNull(
                    winratePerCountry,
                    nationalityTwo,
                    match.playerTwo,
                    "wins",
                    1,
                );
            } else {
                this.increaseIfNotNull(
                    winratePerCountry,
                    nationalityOne,
                    match.playerOne,
                    "wins",
                    0.5,
                );
                this.increaseIfNotNull(
                    winratePerCountry,
                    nationalityTwo,
                    match.playerTwo,
                    "wins",
                    0.5,
                );
            }
        }

        const result: LeaderboardRow[] = winratePerCountry.mapAll(
            (country, players) => {
                const totalMatches =
                    players
                        .mapAll((k, v) => v.matches)
                        .reduce((prev, cur) => prev + cur, 0) -
                    sameCountryMatchups.get(country);
                const totalWins = players
                    .mapAll((k, v) => v.wins)
                    .reduce((prev, cur) => prev + cur, 0);

                return {
                    columns: {
                        Flag: `https://flagicons.lipis.dev/flags/4x3/${country}.svg`,
                        Country: this.getCountryName(country),
                        Winrate: totalWins / totalMatches,
                        "Total matches": totalMatches,
                    },
                    value: totalWins / totalMatches,
                    order: 0,
                    expandableRows: players
                        .mapAll((player, value) => {
                            return {
                                player,
                                wr: value.wins / value.matches,
                                matches: value.matches,
                            };
                        })
                        .toSorted((a, b) => b.wr - a.wr)
                        .map((player) => [
                            nameMap[player.player] ?? player.player,
                            (player.wr * 100).toFixed(2) + "%",
                            player.matches,
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

    private increaseIfNotNull<K, T, V>(
        map: DefaultedMap<K, DefaultedMap<T, V>>,
        keyOne: K | null,
        keyTwo: T | null,
        attribute: keyof V,
        increase: number,
    ) {
        if (keyOne == null || keyTwo == null) return;
        (map.get(keyOne).get(keyTwo)[attribute] as number) += increase;
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Winrate per country",
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
                { name: "Winrate", type: LeaderboardColumnType.PERCENTAGE },
                {
                    name: "Total matches",
                    type: LeaderboardColumnType.TEXT,
                    filterable: LeaderboardFilterType.NUMERIC,
                    defaultFilter: 5,
                },
            ],
        };
    }
}
