import { IPlayerStatistics } from "~/utils/interfaces/IPlayer";
import { Match } from "../model/Match";
import MatchCollection from "../../utils/playerStatistics/MatchCollection";
import PlacementCollection from "../../utils/playerStatistics/PlacementCollection";
import { Competition, CompetitionPlacement } from "../model/Competition";
import { In } from "typeorm";

export default class PlayerStatisticController {
    private static cache: Map<string, IPlayerStatistics> = new Map();

    public static clearCache(): void {
        PlayerStatisticController.cache.clear();
    }

    public static async get(uuid: string): Promise<IPlayerStatistics> {
        if (!PlayerStatisticController.cache.has(uuid)) {
            await PlayerStatisticController.calculate(uuid);
        }
        return PlayerStatisticController.cache.get(uuid)!;
    }

    private static async calculate(uuid: string) {
        const matches = await Match.find({
            where: [{ playerOne: uuid }, { playerTwo: uuid }],
            order: { timestamp: "DESC" },
        });
        const placements = await CompetitionPlacement.findBy({ player: uuid });
        const competitions = await Competition.findBy({
            tag: In(placements.map((p) => p.competition)),
        });

        const matchCollection = new MatchCollection(matches, uuid);
        const placementCollection = new PlacementCollection(
            placements,
            competitions,
        );

        PlayerStatisticController.cache.set(uuid, {
            winrate: matchCollection.winrate(),
            mapWinrate: matchCollection.mapWinrate(),
            bestPlacement: placementCollection.bestPlacement(),
            winTieLoss: matchCollection.wtl(),
            debutMatch: matchCollection.earliestMatch(),
            matchCount: matchCollection.amountMatches(),
            mapCount: matchCollection.amountMaps(),
            officialCompetitionCount: placementCollection.amountCompetitions(),
            competitionsWon: placementCollection.amountWins(),
            averagePlacement: placementCollection.averagePlacement(),
            mapsPicked: matchCollection.mapPickAmount(),
            mapsBanned: matchCollection.mapBanAmount(),
            mapsPlayed: matchCollection.mapPlayAmount(),
            mapsWon: matchCollection.mapWinAmount(),
            perMapWinrate: matchCollection.perMapWinrate(),
        });
    }
}
