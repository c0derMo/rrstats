import { Log } from "~/utils/FunctionTimer";
import { Achievement } from "../model/Achievement";
import { Match } from "../model/Match";
import { SpinTheWheel } from "./achievements/SpinTheWheel";
import consola from "consola";
import {
    type EntitySubscriberInterface,
    EventSubscriber,
    type InsertEvent,
    type UpdateEvent,
} from "typeorm";
import type { AchievementInfo } from "~/utils/interfaces/AchievementInfo";
import { Globetrotter } from "./achievements/Globetrotter";
import { Player } from "../model/Player";

export enum AchievementTier {
    BRONZE,
    SILVER,
    GOLD,
    PLATINUM,
}

export interface AchievementData
    extends Omit<AchievementInfo, "achievedAt" | "progress"> {
    update(
        match: Match,
        playerOneAchievement: Achievement,
        playerTwoAchievement: Achievement,
    ): Promise<void>;
    recalculateAll(
        matches: Match[],
        achievements: Record<string, Achievement>,
    ): Promise<void>;
    getDefaultData(): unknown;
}

const logger = consola.withTag("rrstats:database");

export default class AchievementController {
    private static readonly achievements: AchievementData[] = [
        new SpinTheWheel(),
        new Globetrotter(),
    ];

    public static async getAchievementOfPlayerOrCreate(
        player: string,
        achievement: AchievementData,
    ): Promise<Achievement> {
        let playerAchievement = await Achievement.findOneBy({
            player: player,
            achievement: achievement.name,
        });
        if (playerAchievement == null) {
            playerAchievement = new Achievement();
            playerAchievement.player = player;
            playerAchievement.achievement = achievement.name;
            playerAchievement.achievedAt = Array(achievement.levels).fill(0);
            playerAchievement.progression = Array(achievement.levels).fill(0);
            playerAchievement.data = achievement.getDefaultData();
            playerAchievement.verified = true;
        }
        return playerAchievement;
    }

    public static async getAchievementsOfPlayer(
        player: string,
    ): Promise<AchievementInfo[]> {
        const achievedAchievements = await Achievement.find({
            where: {
                player: player,
            },
        });

        return AchievementController.achievements.map((achievement) => {
            const result = {
                name: achievement.name,
                description: achievement.description,
                tier: achievement.tier,
                manual: achievement.manual,
                category: achievement.category,
                levels: achievement.levels,
                achievedAt: Array(achievement.levels).fill(0),
                progress: Array(achievement.levels).fill(0),
            };

            const achieved = achievedAchievements.find(
                (aA) => aA.achievement === achievement.name,
            );
            if (achieved != null) {
                result.achievedAt = achieved.achievedAt;
                result.progress = achieved.progression;
            }
            return result;
        });
    }

    public static async updateAchievements(match: Match): Promise<void> {
        const promises = AchievementController.achievements.map((m) =>
            (async () => {
                const playerOneAchievement =
                    await AchievementController.getAchievementOfPlayerOrCreate(
                        match.playerOne,
                        m,
                    );
                const playerTwoAchievement =
                    await AchievementController.getAchievementOfPlayerOrCreate(
                        match.playerTwo,
                        m,
                    );
                await m.update(
                    match,
                    playerOneAchievement,
                    playerTwoAchievement,
                );
                await playerOneAchievement.save();
                await playerTwoAchievement.save();
            })(),
        );
        await Promise.allSettled(promises);
    }

    @Log("AchievementController.recalculateAllAchievements")
    public static async recalculateAllAchievements(): Promise<void> {
        const matches = await Match.find({
            order: {
                timestamp: "ASC",
            },
        });

        const allPlayers = await Player.find({
            select: ["uuid"],
        });

        const promises = AchievementController.achievements.map((m) =>
            (async () => {
                const playerAchievements: Record<string, Achievement> = {};
                for (const player of allPlayers) {
                    playerAchievements[player.uuid] =
                        await AchievementController.getAchievementOfPlayerOrCreate(
                            player.uuid,
                            m,
                        );
                }
                await m.recalculateAll(matches, playerAchievements);
                for (const player in playerAchievements) {
                    await playerAchievements[player].save();
                }
            })(),
        );
        await Promise.allSettled(promises);

        logger.info("Achievements recalculated.");
    }
}

@EventSubscriber()
export class AchievementDatabaseListener
    implements EntitySubscriberInterface<Match>
{
    listenTo() {
        return Match;
    }

    async afterInsert(event: InsertEvent<Match>): Promise<void> {
        await AchievementController.updateAchievements(event.entity);
    }

    async afterUpdate(event: UpdateEvent<Match>): Promise<void> {
        await AchievementController.updateAchievements(event.databaseEntity);
    }
}
