import type { IPlayerStatistics } from "~/utils/interfaces/IPlayer";
import { Match } from "../model/Match";
import MatchCollection from "../../utils/playerStatistics/MatchCollection";
import PlacementCollection from "../../utils/playerStatistics/PlacementCollection";
import { Competition, CompetitionPlacement } from "../model/Competition";
import {
    type EntitySubscriberInterface,
    EventSubscriber,
    In,
    type InsertEvent,
    type UpdateEvent,
} from "typeorm";
import { Player } from "../model/Player";
import { Log } from "~/utils/FunctionTimer";
import EloController from "./EloController";
import { DebouncedInvalidationFunction } from "~/utils/DebouncedInvalidationFunction";

export default class PlayerStatisticController {
    private static cache: Map<string, IPlayerStatistics> = new Map();

    public static clearCache(): void {
        PlayerStatisticController.cache.clear();
    }

    public static async get(
        uuid: string,
        opponent?: string,
    ): Promise<IPlayerStatistics> {
        if (!PlayerStatisticController.cache.has(uuid)) {
            await PlayerStatisticController.calculate(uuid);
        }

        const stats = PlayerStatisticController.cache.get(uuid)!;

        if (opponent != null) {
            const matches = await Match.find({
                where: {
                    playerOne: In([uuid, opponent]),
                    playerTwo: In([uuid, opponent]),
                },
            });
            const matchCollection = new MatchCollection(matches, uuid);
            stats.h2hVsOpponent = matchCollection.wtl();
        }

        return stats;
    }

    @Log("PlayerStatisticController.calculate")
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
            mapPBs: matchCollection.mapPBs(),
            eloProgression:
                EloController.getInstance().getEloProgressionOfPlayer(uuid),
        });
    }
}

@EventSubscriber()
export class PlayerStatisticDatabaseListener
    implements EntitySubscriberInterface
{
    private functionCaller = new DebouncedInvalidationFunction(
        PlayerStatisticController.clearCache,
    );

    afterInsert(event: InsertEvent<unknown>): void {
        this.invalidateLeaderboard(event.entity);
    }

    afterUpdate(event: UpdateEvent<unknown>): void {
        this.invalidateLeaderboard(event.entity);
    }

    private invalidateLeaderboard(entity: unknown) {
        if (
            !(
                entity instanceof Player ||
                entity instanceof Match ||
                entity instanceof CompetitionPlacement ||
                entity instanceof Competition
            )
        ) {
            return;
        }

        this.functionCaller.call();
    }
}
