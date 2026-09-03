import { Player } from "~~/server/model/Player";
import MapperService from "../../MapperService";
import { Match } from "~~/server/model/Match";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class CountryWins extends BaseLeaderboardStatistic {
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
        ) as Record<string, string>;
        const nameMap = MapperService.createStringMapFromList(
            players,
            "uuid",
            "primaryName",
        );

        const winsPerCountry: DefaultedMap<
            string,
            DefaultedMap<string, number>
        > = new DefaultedMap(() => new DefaultedMap(() => 0));
        for (const match of filterForfeitMatches(matches)) {
            const nationalityOne = countryMap[match.playerOne];
            const nationalityTwo = countryMap[match.playerTwo];

            if (match.playerOneScore > match.playerTwoScore) {
                this.increaseIfNotNull(
                    winsPerCountry,
                    nationalityOne,
                    match.playerOne,
                    1,
                );
            } else if (match.playerTwoScore > match.playerOneScore) {
                this.increaseIfNotNull(
                    winsPerCountry,
                    nationalityTwo,
                    match.playerTwo,
                    1,
                );
            } else {
                this.increaseIfNotNull(
                    winsPerCountry,
                    nationalityOne,
                    match.playerOne,
                    0.5,
                );
                this.increaseIfNotNull(
                    winsPerCountry,
                    nationalityTwo,
                    match.playerTwo,
                    0.5,
                );
            }
        }

        const result: LeaderboardRow[] = winsPerCountry.mapAll(
            (country, players) => {
                const sum = getSumOfValues(players);
                return {
                    columns: {
                        Flag: `https://flagicons.lipis.dev/flags/4x3/${country}.svg`,
                        Country: this.getCountryName(country),
                        Wins: sum,
                    },
                    value: sum,
                    order: 0,
                    expandableRows: players
                        .mapAll((player, wins) => {
                            return { player, wins };
                        })
                        .toSorted((a, b) => b.wins - a.wins)
                        .map((player) => [
                            nameMap[player.player] ?? player.player,
                            player.wins.toString(),
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

    private increaseIfNotNull<K, T>(
        map: DefaultedMap<K, DefaultedMap<T, number>>,
        keyOne: K | null,
        keyTwo: T | null,
        increase: number,
    ) {
        if (keyOne == null || keyTwo == null) return;
        map.get(keyOne).set(keyTwo, map.get(keyOne).get(keyTwo) + increase);
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Most wins per country",
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
                { name: "Wins", type: LeaderboardColumnType.TEXT },
            ],
        };
    }
}
