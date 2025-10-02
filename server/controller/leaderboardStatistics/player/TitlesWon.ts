import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";

export class PlayerTitlesWon implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Titles won";
    hasMaps = false;

    calculate(
        players: IPlayer[],
        matches: IMatch[],
        placements: ICompetitionPlacement[],
    ): LeaderboardPlayerEntry[] {
        const titlesPerPlayer: DefaultedMap<string, number> = new DefaultedMap(
            () => 0,
        );

        for (const placement of placements) {
            if (placement.placement !== 1) continue;
            titlesPerPlayer.set(
                placement.player,
                titlesPerPlayer.get(placement.player) + 1,
            );
        }

        const result: LeaderboardPlayerEntry[] = titlesPerPlayer.mapAll(
            (player, wins) => {
                return {
                    player,
                    displayScore: wins.toString(),
                    sortingScore: wins,
                };
            },
        );
        result.sort((a, b) => b.sortingScore - a.sortingScore);
        return result;
    }
}
