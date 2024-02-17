import { LeaderboardCountryStatistic } from "../../LeaderboardController";
import { IPlayer } from "~/utils/interfaces/IPlayer";
import { LeaderboardCountryEntry } from "~/utils/interfaces/LeaderboardEntry";
import MapperService from "../../MapperService";
import { IMatch } from "~/utils/interfaces/IMatch";

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

        const matchesPerCountry: Record<string, number> = {};
        for (const match of matches) {
            const nationalityOne = countryMap[match.playerOne];
            const nationalityTwo = countryMap[match.playerTwo];

            if (nationalityOne != null) {
                if (matchesPerCountry[nationalityOne] == null)
                    matchesPerCountry[nationalityOne] = 0;
                matchesPerCountry[nationalityOne] += 1;
            }
            if (nationalityTwo != null && nationalityOne !== nationalityTwo) {
                if (matchesPerCountry[nationalityTwo] == null)
                    matchesPerCountry[nationalityTwo] = 0;
                matchesPerCountry[nationalityTwo] += 1;
            }
        }

        const result: LeaderboardCountryEntry[] = [];
        for (const country in matchesPerCountry) {
            result.push({
                countryCode: country,
                country: this.getCountryName(country),
                displayScore: matchesPerCountry[country].toString(),
                sortingScore: matchesPerCountry[country],
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
