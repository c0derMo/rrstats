import { LeaderboardCountryStatistic } from "../../LeaderboardController";
import { IPlayer } from "~/utils/interfaces/IPlayer";
import { LeaderboardCountryEntry } from "~/utils/interfaces/LeaderboardEntry";
import MapperService from "../../MapperService";
import { IMatch } from "~/utils/interfaces/IMatch";

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

        const winsPerCountry: Record<string, number> = {};
        for (const match of matches) {
            const nationalityOne = countryMap[match.playerOne];
            const nationalityTwo = countryMap[match.playerTwo];

            if (match.playerOneScore > match.playerTwoScore) {
                if (nationalityOne != null) {
                    if (winsPerCountry[nationalityOne] == null)
                        winsPerCountry[nationalityOne] = 0;
                    winsPerCountry[nationalityOne] += 1;
                }
            } else if (match.playerTwoScore > match.playerOneScore) {
                if (nationalityTwo != null) {
                    if (winsPerCountry[nationalityTwo] == null)
                        winsPerCountry[nationalityTwo] = 0;
                    winsPerCountry[nationalityTwo] += 1;
                }
            } else {
                if (nationalityOne != null) {
                    if (winsPerCountry[nationalityOne] == null)
                        winsPerCountry[nationalityOne] = 0;
                    winsPerCountry[nationalityOne] += 0.5;
                }
                if (nationalityTwo != null) {
                    if (winsPerCountry[nationalityTwo] == null)
                        winsPerCountry[nationalityTwo] = 0;
                    winsPerCountry[nationalityTwo] += 0.5;
                }
            }
        }

        const result: LeaderboardCountryEntry[] = [];
        for (const country in winsPerCountry) {
            result.push({
                countryCode: country,
                country: this.getCountryName(country),
                displayScore: winsPerCountry[country].toString(),
                sortingScore: winsPerCountry[country],
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
