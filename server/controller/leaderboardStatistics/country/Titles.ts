import { LeaderboardCountryStatistic } from "../../LeaderboardController";
import { IPlayer } from "~/utils/interfaces/IPlayer";
import { LeaderboardCountryEntry } from "~/utils/interfaces/LeaderboardEntry";
import MapperService from "../../MapperService";
import { IMatch } from "~/utils/interfaces/IMatch";
import { ICompetitionPlacement } from "~/utils/interfaces/ICompetition";
import { DefaultedMap, getSumOfValues } from "~/utils/DefaultedMap";

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

        const titlesPerCountry: DefaultedMap<
            string,
            DefaultedMap<string, number>
        > = new DefaultedMap(() => new DefaultedMap(() => 0));
        for (const placement of placements) {
            if (placement.placement !== 1) continue;
            const nationality = countryMap[placement.player];
            if (nationality != null) {
                const countryMap = titlesPerCountry.get(nationality);
                countryMap.set(
                    placement.player,
                    countryMap.get(placement.player) + 1,
                );
            }
        }

        const result: LeaderboardCountryEntry[] = [];
        for (const country in titlesPerCountry.getAll()) {
            result.push({
                countryCode: country,
                country: this.getCountryName(country),
                displayScore: getSumOfValues(
                    titlesPerCountry.get(country),
                ).toString(),
                sortingScore: getSumOfValues(titlesPerCountry.get(country)),
                players: titlesPerCountry
                    .get(country)
                    .mapAll((key, value) => {
                        return {
                            player: key,
                            sortingScore: value,
                            displayScore: value.toString(),
                        };
                    })
                    .sort((a, b) => b.sortingScore - a.sortingScore),
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
