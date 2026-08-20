import { Player } from "~~/server/model/Player";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class CountryPlayers extends BaseLeaderboardStatistic {
    basedOn() {
        return ["player" as const];
    }

    async calculate(): Promise<void> {
        const players = await Player.createQueryBuilder("player")
            .select(["player.uuid", "player.nationality", "player.primaryName"])
            .getMany();

        const countryMap: DefaultedMap<string, string[]> = new DefaultedMap(
            () => [],
        );
        for (const player of players) {
            if (player.nationality == null) continue;
            countryMap.get(player.nationality).push(player.primaryName);
        }

        const result: LeaderboardRow[] = countryMap.mapAll((key, value) => {
            const columnPlayers: string[][] = [];
            for (let i = 0; i < Math.ceil(value.length / 3); i++) {
                const p1 = value[i * 3] ?? "";
                const p2 = value[i * 3 + 1] ?? "";
                const p3 = value[i * 3 + 2] ?? "";
                columnPlayers.push([p1, p2, p3]);
            }

            return {
                columns: {
                    Flag: `https://flagicons.lipis.dev/flags/4x3/${key}.svg`,
                    Country: this.getCountryName(key),
                    Players: value.length,
                },
                value: value.length,
                order: 0,
                expandableRows: columnPlayers,
            };
        });
        this.sortAndInferPlacementByValue(result);
        this.cache = result;
    }

    private getCountryName(code: string) {
        return (
            new Intl.DisplayNames(["en"], { type: "region" }).of(
                code.toUpperCase(),
            ) ?? `Unknown country: ${code}`
        );
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Most players per country",
            category: "country",
            columns: [
                {
                    name: "Placement",
                    type: LeaderboardColumnType.PLACEMENT_TAG,
                },
                { name: "Flag", type: LeaderboardColumnType.IMAGE },
                {
                    name: "Country",
                    type: LeaderboardColumnType.TEXT,
                    searchable: true,
                },
                { name: "Players", type: LeaderboardColumnType.TEXT },
            ],
        };
    }
}
