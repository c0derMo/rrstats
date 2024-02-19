import { LeaderboardCountryStatistic } from "../../LeaderboardController";
import { IPlayer } from "~/utils/interfaces/IPlayer";
import { LeaderboardCountryEntry } from "~/utils/interfaces/LeaderboardEntry";
import MapperService from "../../MapperService";
import { IMatch } from "~/utils/interfaces/IMatch";
import { DefaultedMap, getSumOfValues } from "~/utils/DefaultedMap";

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

        const winsPerCountry: DefaultedMap<DefaultedMap<number>> = new DefaultedMap(() => new DefaultedMap(() => 0));
        for (const match of matches) {
            const nationalityOne = countryMap[match.playerOne];
            const nationalityTwo = countryMap[match.playerTwo];

            if (match.playerOneScore > match.playerTwoScore) {
                if (nationalityOne != null) {
                    const countryOne = winsPerCountry.get(nationalityOne);
                    countryOne.set(match.playerOne, countryOne.get(match.playerOne) + 1);
                }
            } else if (match.playerTwoScore > match.playerOneScore) {
                if (nationalityTwo != null) {
                    const countryTwo = winsPerCountry.get(nationalityTwo);
                    countryTwo.set(match.playerTwo, countryTwo.get(match.playerTwo) + 1);
                }
            } else {
                if (nationalityOne != null) {
                    const countryOne = winsPerCountry.get(nationalityOne);
                    countryOne.set(match.playerOne, countryOne.get(match.playerOne) + 0.5);
                }
                if (nationalityTwo != null) {
                    const countryTwo = winsPerCountry.get(nationalityTwo);
                    countryTwo.set(match.playerTwo, countryTwo.get(match.playerTwo) + 0.5);
                }
            }
        }

        const result: LeaderboardCountryEntry[] = [];
        for (const country in winsPerCountry.getAll()) {
            result.push({
                countryCode: country,
                country: this.getCountryName(country),
                displayScore: getSumOfValues(winsPerCountry.get(country)).toString(),
                sortingScore: getSumOfValues(winsPerCountry.get(country)),
                players: winsPerCountry.get(country).mapAll((player, wins) => {
                    return {
                        player: player,
                        sortingScore: wins,
                        displayScore: wins.toString()
                    }
                }).sort((a, b) => b.sortingScore - a.sortingScore)
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
