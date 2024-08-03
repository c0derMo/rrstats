import type { LeaderboardCountryStatistic } from "../../LeaderboardController";
import type { IPlayer } from "~/utils/interfaces/IPlayer";
import type { LeaderboardCountryEntry } from "~/utils/interfaces/LeaderboardEntry";
import MapperService from "../../MapperService";
import type { IMatch } from "~/utils/interfaces/IMatch";
import { DefaultedMap, getSumOfValues } from "~/utils/DefaultedMap";
import { filterForfeitMatches } from "~/utils/matchUtils";

export class CountryWins implements LeaderboardCountryStatistic {
    type = "country" as const;
    name = "Wins per country";
    hasMaps = false;

    calculate(
        players: IPlayer[],
        matches: IMatch[],
    ): LeaderboardCountryEntry[] {
        const countryMap = MapperService.createStringMapFromList(
            players,
            "uuid",
            "nationality",
        ) as Record<string, string>;

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

        const result: LeaderboardCountryEntry[] = winsPerCountry.mapAll(
            (country, players) => {
                return {
                    countryCode: country,
                    country: this.getCountryName(country),
                    displayScore: getSumOfValues(players).toString(),
                    sortingScore: getSumOfValues(players),
                    players: players
                        .mapAll((player, wins) => {
                            return {
                                player: player,
                                sortingScore: wins,
                                displayScore: wins.toString(),
                            };
                        })
                        .sort((a, b) => b.sortingScore - a.sortingScore),
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

    private increaseIfNotNull<K, T>(
        map: DefaultedMap<K, DefaultedMap<T, number>>,
        keyOne: K | null,
        keyTwo: T | null,
        increase: number,
    ) {
        if (keyOne == null || keyTwo == null) return;
        map.get(keyOne).set(keyTwo, map.get(keyOne).get(keyTwo) + increase);
    }
}
