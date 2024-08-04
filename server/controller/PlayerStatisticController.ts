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
import { DateTime } from "luxon";
import { Player } from "../model/Player";

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
            mapPBs: matchCollection.mapPBs(),
        });
    }
}

@EventSubscriber()
export class PlayerStatisticDatabaseListener
    implements EntitySubscriberInterface
{
    private lastDatabaseWrite: DateTime;
    private timerStart: DateTime;
    private invalidationTimer: NodeJS.Timeout | null = null;

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

        this.lastDatabaseWrite = DateTime.now();
        if (this.invalidationTimer === null) {
            this.timerStart = DateTime.now();
            this.invalidationTimer = setInterval(() => {
                const startDiff = Math.abs(
                    this.timerStart.diffNow().toMillis(),
                );
                const lastWriteDiff = Math.abs(
                    this.lastDatabaseWrite.diffNow().toMillis(),
                );
                if (startDiff > 1000 || lastWriteDiff > 100) {
                    void PlayerStatisticController.clearCache();
                    clearInterval(this.invalidationTimer as NodeJS.Timeout);
                    this.invalidationTimer = null;
                }
            }, 50);
        }
    }
}
