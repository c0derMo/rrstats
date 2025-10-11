import { Player } from "~~/server/model/Player";
import type { LeaderboardCountryStatistic } from "../../LeaderboardController";
import MapperService from "../../MapperService";
import { Match } from "~~/server/model/Match";

export class CountryWinrate implements LeaderboardCountryStatistic {
    type = "country" as const;
    name = "Winrate per country";
    hasMaps = false;
    secondaryFilter = "Matches played";
    defaultSecondaryFilter = 5;

    basedOn = ["player" as const, "match" as const];

    async calculate(): Promise<LeaderboardCountryEntry[]> {
        const players = await Player.createQueryBuilder("player")
            .select(["player.uuid", "player.nationality"])
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

        const result: LeaderboardCountryEntry[] = winratePerCountry.mapAll(
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
                    countryCode: country,
                    country: this.getCountryName(country),
                    displayScore:
                        ((totalWins / totalMatches) * 100).toFixed(2) + "%",
                    sortingScore: totalWins / totalMatches,
                    players: players
                        .mapAll((player, value) => {
                            return {
                                player: player,
                                displayScore:
                                    (
                                        (value.wins / value.matches) *
                                        100
                                    ).toFixed(2) + "%",
                                sortingScore: value.wins / value.matches,
                            };
                        })
                        .sort((a, b) => b.sortingScore - a.sortingScore),
                    secondaryScore: totalMatches,
                };
            },
        );
        result.sort((a, b) => b.sortingScore - a.sortingScore);

        return result;
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
}
