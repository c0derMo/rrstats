import type { LeaderboardCountryStatistic } from "../../LeaderboardController";
import type { IPlayer } from "~/utils/interfaces/IPlayer";
import type { LeaderboardCountryEntry } from "~/utils/interfaces/LeaderboardEntry";
import MapperService from "../../MapperService";
import type { IMatch } from "~/utils/interfaces/IMatch";
import { DefaultedMap, getSumOfValues } from "~/utils/DefaultedMap";

export class CountryMatches implements LeaderboardCountryStatistic {
    type = "country" as const;
    name = "Matches per country";
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

        const result: LeaderboardCountryEntry[] = matchesPerCountry.mapAll(
            (country, players) => {
                return {
                    countryCode: country,
                    country: this.getCountryName(country),
                    displayScore: getSumOfValues(players).toString(),
                    sortingScore: getSumOfValues(players),
                    players: players
                        .mapAll((player, matches) => {
                            return {
                                player: player,
                                displayScore: matches.toString(),
                                sortingScore: matches,
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
}
