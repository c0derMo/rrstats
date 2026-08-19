import { SimpleMapLeaderboardStatistic } from "./SimpleMapLeaderboardStatistic";

export class MapRNG extends SimpleMapLeaderboardStatistic {
    constructor() {
        super("Played as random map", "Played as random map");
    }

    computeMapStats(competitions: ICompetition[], matches: IMatch[]): void {
        for (const match of matches) {
            const compIndex = competitions.findIndex(
                (comp) => comp.tag === match.competition,
            );
            if (compIndex < 0) {
                continue;
            }

            for (const map of match.playedMaps) {
                if (map.picked !== ChoosingPlayer.RANDOM) continue;

                this.mapCache!.get(map.map)[compIndex] += 1;
            }
        }
    }
}
