import { LeaderboardCountryStatistic } from "../../LeaderboardController";
import { IPlayer } from "~/utils/interfaces/IPlayer";
import { LeaderboardCountryEntry } from "~/utils/interfaces/LeaderboardEntry";
import MapperService from "../../MapperService";
import { IMatch } from "~/utils/interfaces/IMatch";
import { DefaultedMap } from "~/utils/DefaultedMap";

export class CountryWinrate implements LeaderboardCountryStatistic {
    type = "country" as const;
    name = "Winrate per country";
    hasMaps = false;
    secondaryFilter = "Matches played";

    calculate(
        players: IPlayer[],
        matches: IMatch[],
    ): LeaderboardCountryEntry[] {
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
        for (const match of matches) {
            const nationalityOne = countryMap[match.playerOne];
            const nationalityTwo = countryMap[match.playerTwo];

            if (nationalityOne != null) {
                winratePerCountry
                    .get(nationalityOne)
                    .get(match.playerOne).matches += 1;
            }
            if (nationalityTwo != null && nationalityOne !== nationalityTwo) {
                winratePerCountry
                    .get(nationalityTwo)
                    .get(match.playerTwo).matches += 1;
            }

            if (match.playerOneScore > match.playerTwoScore) {
                if (nationalityOne != null) {
                    winratePerCountry
                        .get(nationalityOne)
                        .get(match.playerOne).wins += 1;
                }
            } else if (match.playerTwoScore > match.playerOneScore) {
                if (nationalityTwo != null) {
                    winratePerCountry
                        .get(nationalityTwo)
                        .get(match.playerTwo).wins += 1;
                }
            } else {
                if (nationalityOne != null) {
                    winratePerCountry
                        .get(nationalityOne)
                        .get(match.playerOne).wins += 0.5;
                }
                if (nationalityTwo != null) {
                    winratePerCountry
                        .get(nationalityTwo)
                        .get(match.playerTwo).wins += 0.5;
                }
            }
        }

        const result: LeaderboardCountryEntry[] = [];
        for (const country in winratePerCountry.getAll()) {
            const totalMatches = winratePerCountry
                .get(country)
                .mapAll((k, v) => v.matches)
                .reduce((prev, cur) => prev + cur);
            const totalWins = winratePerCountry
                .get(country)
                .mapAll((k, v) => v.wins)
                .reduce((prev, cur) => prev + cur);

            result.push({
                countryCode: country,
                country: this.getCountryName(country),
                displayScore:
                    ((totalWins / totalMatches) * 100).toFixed(2) + "%",
                sortingScore: totalWins / totalMatches,
                players: winratePerCountry
                    .get(country)
                    .mapAll((player, value) => {
                        return {
                            player: player,
                            displayScore:
                                ((value.wins / value.matches) * 100).toFixed(
                                    2,
                                ) + "%",
                            sortingScore: value.wins / value.matches,
                        };
                    })
                    .sort((a, b) => b.sortingScore - a.sortingScore),
                secondaryScore: totalMatches,
            });
        }
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
