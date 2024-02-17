import { LeaderboardCountryStatistic } from "../../LeaderboardController";
import { IPlayer } from "~/utils/interfaces/IPlayer";
import { LeaderboardCountryEntry } from "~/utils/interfaces/LeaderboardEntry";

export class CountryPlayers implements LeaderboardCountryStatistic {
    type = "country" as const;
    name = "Players per country";
    hasMaps = false;

    calculate(players: IPlayer[]): LeaderboardCountryEntry[] {
        const countryMap: Record<string, number> = {};
        for (const player of players) {
            if (player.nationality == null) continue;
            if (countryMap[player.nationality] == null)
                countryMap[player.nationality] = 0;
            countryMap[player.nationality] += 1;
        }

        const result: LeaderboardCountryEntry[] = [];
        for (const country in countryMap) {
            result.push({
                countryCode: country,
                country: this.getCountryName(country),
                displayScore: countryMap[country].toString(),
                sortingScore: countryMap[country],
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
