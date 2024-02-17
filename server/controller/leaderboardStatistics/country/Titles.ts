import { LeaderboardCountryStatistic } from "../../LeaderboardController";
import { IPlayer } from "~/utils/interfaces/IPlayer";
import { LeaderboardCountryEntry } from "~/utils/interfaces/LeaderboardEntry";
import MapperService from "../../MapperService";
import { IMatch } from "~/utils/interfaces/IMatch";
import { ICompetitionPlacement } from "~/utils/interfaces/ICompetition";

export class CountryTitles implements LeaderboardCountryStatistic {
    type = "country" as const;
    name = "Titles per country";
    hasMaps = false;

    calculate(
        players: IPlayer[],
        matches: IMatch[],
        placements: ICompetitionPlacement[],
    ): LeaderboardCountryEntry[] {
        const countryMap = MapperService.createStringMapFromList(
            players,
            "uuid",
            "nationality",
        ) as Record<string, string>;

        const titlesPerCountry: Record<string, number> = {};
        for (const placement of placements) {
            if (placement.placement !== 1) continue;
            const nationality = countryMap[placement.player];
            if (nationality != null) {
                if (titlesPerCountry[nationality] == null)
                    titlesPerCountry[nationality] = 0;
                titlesPerCountry[nationality] += 1;
            }
        }

        const result: LeaderboardCountryEntry[] = [];
        for (const country in titlesPerCountry) {
            result.push({
                countryCode: country,
                country: this.getCountryName(country),
                displayScore: titlesPerCountry[country].toString(),
                sortingScore: titlesPerCountry[country],
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
