import type { LeaderboardCountryStatistic } from "../../LeaderboardController";
import MapperService from "../../MapperService";

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

        const result: LeaderboardCountryEntry[] = titlesPerCountry.mapAll(
            (country, players) => {
                return {
                    countryCode: country,
                    country: this.getCountryName(country),
                    displayScore: getSumOfValues(players).toString(),
                    sortingScore: getSumOfValues(players),
                    players: players
                        .mapAll((key, value) => {
                            return {
                                player: key,
                                sortingScore: value,
                                displayScore: value.toString(),
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
