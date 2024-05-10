import { DefaultedMap } from "~/utils/DefaultedMap";
import { LeaderboardCountryStatistic } from "../../LeaderboardController";
import { IPlayer } from "~/utils/interfaces/IPlayer";
import { LeaderboardCountryEntry } from "~/utils/interfaces/LeaderboardEntry";

export class CountryPlayers implements LeaderboardCountryStatistic {
    type = "country" as const;
    name = "Players per country";
    hasMaps = false;

    calculate(players: IPlayer[]): LeaderboardCountryEntry[] {
        const countryMap: DefaultedMap<string[]> = new DefaultedMap(() => []);
        for (const player of players) {
            if (player.nationality == null) continue;
            countryMap.get(player.nationality).push(player.uuid);
        }

        const result: LeaderboardCountryEntry[] = [];
        for (const country in countryMap.getAll()) {
            result.push({
                countryCode: country,
                country: this.getCountryName(country),
                displayScore: countryMap.get(country).length.toString(),
                sortingScore: countryMap.get(country).length,
                players: countryMap.get(country).map((player) => {
                    return {
                        player,
                        displayScore: "",
                        sortingScore: 0,
                    };
                }),
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
