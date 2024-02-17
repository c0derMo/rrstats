import { LeaderboardCountryStatistic } from "../../LeaderboardController";
import { IPlayer } from "~/utils/interfaces/IPlayer";
import { LeaderboardCountryEntry } from "~/utils/interfaces/LeaderboardEntry";
import MapperService from "../../MapperService";
import { IMatch } from "~/utils/interfaces/IMatch";

export class CountryWinrate implements LeaderboardCountryStatistic {
    type = "country" as const;
    name = "Winrate per country";
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

        const winratePerCountry: Record<
            string,
            { wins: number; matches: number }
        > = {};
        for (const match of matches) {
            const nationalityOne = countryMap[match.playerOne];
            const nationalityTwo = countryMap[match.playerTwo];

            if (nationalityOne != null) {
                if (winratePerCountry[nationalityOne] == null)
                    winratePerCountry[nationalityOne] = { wins: 0, matches: 0 };
                winratePerCountry[nationalityOne].matches += 1;
            }
            if (nationalityTwo != null && nationalityOne !== nationalityTwo) {
                if (winratePerCountry[nationalityTwo] == null)
                    winratePerCountry[nationalityTwo] = { wins: 0, matches: 0 };
                winratePerCountry[nationalityTwo].matches += 1;
            }

            if (match.playerOneScore > match.playerTwoScore) {
                if (nationalityOne != null) {
                    winratePerCountry[nationalityOne].wins += 1;
                }
            } else if (match.playerTwoScore > match.playerOneScore) {
                if (nationalityTwo != null) {
                    winratePerCountry[nationalityTwo].wins += 1;
                }
            } else {
                if (nationalityOne != null) {
                    winratePerCountry[nationalityOne].wins += 0.5;
                }
                if (nationalityTwo != null) {
                    winratePerCountry[nationalityTwo].wins += 0.5;
                }
            }
        }

        const result: LeaderboardCountryEntry[] = [];
        for (const country in winratePerCountry) {
            result.push({
                countryCode: country,
                country: this.getCountryName(country),
                displayScore:
                    (
                        (winratePerCountry[country].wins /
                            winratePerCountry[country].matches) *
                        100
                    ).toFixed(2) + "%",
                sortingScore:
                    winratePerCountry[country].wins /
                    winratePerCountry[country].matches,
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
