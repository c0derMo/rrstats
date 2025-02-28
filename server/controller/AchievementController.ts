import { Log } from "~/utils/FunctionTimer";
import { Achievement } from "../model/Achievement";
import { Match } from "../model/Match";
import consola from "consola";
import {
    type EntitySubscriberInterface,
    EventSubscriber,
    type InsertEvent,
    type UpdateEvent,
} from "typeorm";
import type { AchievementInfo } from "~/utils/interfaces/AchievementInfo";
import { Player } from "../model/Player";
import { SpinTheWheel } from "./achievements/automatic/SpinTheWheel";
import { Globetrotter } from "./achievements/automatic/Globetrotter";
import { OneStone } from "./achievements/manual/OneStone";
import NotificationController from "./NotificationController";
import ld from "lodash";
import { RoulettePlayer } from "./achievements/automatic/RoulettePlayer";
import { ReturningRival } from "./achievements/automatic/ReturningRival";
import { AgainstTheWorld } from "./achievements/automatic/AgainstTheWorld";
import { GettingMileage } from "./achievements/automatic/GettingMileage";
import { OpenSeason } from "./achievements/automatic/OpenSeason";
import { PointsForYou } from "./achievements/automatic/PointsForYou";
import {
    CuttingEdge,
    DressedForTheOccasion,
    Kaboom,
    OneOfAKind,
    RememberNoPacify,
    WaitingToHappen,
    WhysItSpicy,
    WorthAShot,
} from "./achievements/automatic/ConditionAchievements";
import { IHateThatMap } from "./achievements/automatic/IHateThatMap";
import { ILoveThatMap } from "./achievements/automatic/ILoveThatMap";
import { HistoryRepeatsItself } from "./achievements/automatic/HistoryRepeatsItself";
import { GloballyInnovative } from "./achievements/automatic/GloballyInnovative";
import { WorldOfAssassination } from "./achievements/automatic/WorldOfAssassination";
import { TheHouseEdge } from "./achievements/automatic/TheHouseEdge";
import { AgainstAllOdds } from "./achievements/automatic/AgainstAllOdds";
import { BeatTheHouse } from "./achievements/automatic/BeatTheHouse";
import { NoWeaknesses } from "./achievements/automatic/NoWeaknesses";
import { FallIntoPlace } from "./achievements/automatic/FallIntoPlace";
import { Champion } from "./achievements/automatic/Champion";
import { WorldChampion } from "./achievements/automatic/WorldChampion";
import { AllRounder } from "./achievements/automatic/AllRounder";
import { isReady } from "..";

export interface AutomaticAchievement
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

export interface ManualAchievement
    extends Omit<AchievementInfo, "achievedAt" | "progress"> {
    manual: boolean;
}

export interface ManualAchievementData {
    video: string;
    notes?: string;
}

const logger = consola.withTag("rrstats:achievements");

export default class AchievementController {
    static readonly automaticAchievements: AutomaticAchievement[] = [
        new RoulettePlayer(),
        new SpinTheWheel(),
        new GettingMileage(),
        new OpenSeason(),
        new Globetrotter(),
        new ReturningRival(),
        new AgainstTheWorld(),

        new PointsForYou(),
        new CuttingEdge(),
        new DressedForTheOccasion(),
        new Kaboom(),
        new WaitingToHappen(),
        new OneOfAKind(),
        new RememberNoPacify(),
        new WhysItSpicy(),
        new WorthAShot(),
        new IHateThatMap(),
        new ILoveThatMap(),
        new HistoryRepeatsItself(),
        new GloballyInnovative(),
        new WorldOfAssassination(),
        new TheHouseEdge(),
        new AgainstAllOdds(),
        new BeatTheHouse(),
        new NoWeaknesses(),

        new FallIntoPlace(),
        new Champion(),
        new WorldChampion(),
        new AllRounder(),
    ];
    static readonly manualAchievements: ManualAchievement[] = [new OneStone()];

    public static async getAchievementOfPlayerOrCreate(
        player: string,
        achievement: AutomaticAchievement,
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
                verified: true,
            },
        });

        const allAchievements: Omit<
            AchievementInfo,
            "progress" | "achievedAt"
        >[] = [
            ...AchievementController.automaticAchievements,
            ...AchievementController.manualAchievements,
        ];

        return allAchievements.map((achievement) => {
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
        const promises = AchievementController.automaticAchievements.map((m) =>
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

        const promises = AchievementController.automaticAchievements.map((m) =>
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

    public static async submitManualAchievement(
        player: string,
        achievement: string,
        video: string,
        notes?: string,
    ): Promise<boolean> {
        const manualAchievement = AchievementController.manualAchievements.find(
            (a) => a.name === achievement,
        );
        if (manualAchievement == null) return false;

        const submission = new Achievement<ManualAchievementData>();
        submission.player = player;
        submission.achievement = manualAchievement.name;
        submission.achievedAt = Array(manualAchievement.levels).fill(0);
        submission.progression = Array(manualAchievement.levels).fill(0);
        submission.data = {
            video,
            notes,
        };
        submission.verified = false;
        await submission.save();

        NotificationController.sendManualAchievementSubmissionNotification(
            manualAchievement,
            submission,
        );

        return true;
    }

    public static async getAchievementStatistics(): Promise<
        Record<string, number[]>
    > {
        const result: Record<string, number[]> = {};
        const totalPlayers = await Player.count();

        const allAchievements: Omit<
            AchievementInfo,
            "progress" | "achievedAt"
        >[] = [
            ...AchievementController.automaticAchievements,
            ...AchievementController.manualAchievements,
        ];

        for (const achievement of allAchievements) {
            const completions: number[] = [];

            const numPlayers = await Achievement.countBy({
                verified: true,
                achievement: achievement.name,
            });

            for (let i = 0; i < achievement.levels; i++) {
                const achieveLevel = Array(achievement.levels)
                    .fill(null)
                    .map((_, idx) => {
                        return achievement.levels - idx - 1 <= i ? "0" : "%";
                    });

                const completed = await Achievement.createQueryBuilder(
                    "achievement",
                )
                    .where("verified = true")
                    .andWhere("achievement = :achievement", {
                        achievement: achievement.name,
                    })
                    .andWhere("achievedAt LIKE :achieveLevel", {
                        achieveLevel: `[${achieveLevel.join(",")}]`,
                    })
                    .getCount();

                completions.push(completed);
            }

            result[achievement.name] = completions.map((completed) => {
                return (numPlayers - completed) / totalPlayers;
            });
        }

        return result;
    }
}

@EventSubscriber()
export class AchievementDatabaseListener
    implements EntitySubscriberInterface<Match>
{
    IGNORED_COLUMNS = [
        "hitmapsMatchId",
        "uuid",
        "notes",
        "shoutcasters",
        "vodLink",
    ];

    listenTo() {
        return Match;
    }

    async afterInsert(event: InsertEvent<Match>): Promise<void> {
        await AchievementController.updateAchievements(event.entity);
    }

    async afterUpdate(event: UpdateEvent<Match>): Promise<void> {
        if (!isReady()) {
            return;
        }
        if (
            event.updatedColumns.some(
                (v) => !this.IGNORED_COLUMNS.includes(v.propertyPath),
            )
        ) {
            logger.info("Updating achievements");
            await AchievementController.recalculateAllAchievements();
        }
    }
}

@EventSubscriber()
export class AchievementVerifyListener
    implements EntitySubscriberInterface<Achievement>
{
    listenTo() {
        return Achievement;
    }

    async afterUpdate(
        event: UpdateEvent<Achievement<ManualAchievementData>>,
    ): Promise<void> {
        const merged = ld.merge({}, event.databaseEntity, event.entity);
        if (
            event.updatedColumns.some((v) => v.propertyPath === "verified") &&
            merged.verified
        ) {
            NotificationController.updateManualAchievementVerified(merged);
            logger.info("After update triggered");
        }
    }
}
