import { SimpleMapLeaderboardStatistic } from "./SimpleMapLeaderboardStatistic";

export class MapAppearance extends SimpleMapLeaderboardStatistic {
    constructor() {
        super(
            "Apperances",
            "Most times appeared",
            "Total of map picked, map banned & map played as random map",
        );
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
            for (const map of match.bannedMaps) {
                this.mapCache!.get(map.map)[compIndex] += 1;
            }
        }
    }
}
