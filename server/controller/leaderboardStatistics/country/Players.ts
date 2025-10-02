import type { LeaderboardCountryStatistic } from "../../LeaderboardController";

export class CountryPlayers implements LeaderboardCountryStatistic {
    type = "country" as const;
    name = "Players per country";
    hasMaps = false;

    calculate(players: IPlayer[]): LeaderboardCountryEntry[] {
        const countryMap: DefaultedMap<string, string[]> = new DefaultedMap(
            () => [],
        );
        for (const player of players) {
            if (player.nationality == null) continue;
            countryMap.get(player.nationality).push(player.uuid);
        }

        const result: LeaderboardCountryEntry[] = countryMap.mapAll(
            (key, value) => {
                return {
                    countryCode: key,
                    country: this.getCountryName(key),
                    displayScore: value.length.toString(),
                    sortingScore: value.length,
                    players: value.map((player) => {
                        return {
                            player,
                            displayScore: "",
                            sortingScore: 0,
                        };
                    }),
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
