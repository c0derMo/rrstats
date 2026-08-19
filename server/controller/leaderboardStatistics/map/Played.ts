import { SimpleMapLeaderboardStatistic } from "./SimpleMapLeaderboardStatistic";

export class MapPlayed extends SimpleMapLeaderboardStatistic {
    constructor() {
        super("Played", "Played");
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
                this.mapCache!.get(map.map)[compIndex] += 1;
            }
        }
    }
}
