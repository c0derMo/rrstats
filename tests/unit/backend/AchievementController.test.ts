import { DateTime } from "luxon";
import { afterEach, beforeEach, describe, test, expect, vi, type MockInstance } from "vitest";
import AchievementController from "~/server/controller/AchievementController";
import DatabaseConnector from "~/server/controller/DatabaseConnnector";
import EloController from "~/server/controller/EloController";
import NotificationController from "~/server/controller/NotificationController";
import { RoulettePlayer } from "~/server/controller/achievements/automatic/experience/RoulettePlayer";
import { Achievement } from "~/server/model/Achievement";
import { Match } from "~/server/model/Match";
import { Player } from "~/server/model/Player";

let database: DatabaseConnector;

describe("AchievementController", () => {
    beforeEach(async () => {
        database = new DatabaseConnector(
            "sqlite",
            "./tests/test_db_post_2024.db",
            false
        );
        await database.initialize();
    });
    afterEach(async () => {
        await database.destroy();
        vi.resetAllMocks();
    });

    test(
        "Performance: Achievement recalculation",
        { timeout: 1000 * 60 * 5 },
        async () => {
            const achievementsPreRecalc = await Achievement.find();
            await EloController.getInstance().fetchCompetitions();
            await EloController.getInstance().recalculateAllElos();
            const startTime = DateTime.now();
            await AchievementController.recalculateAllAchievements();
            expect(startTime.diffNow().as("milliseconds")).toBeLessThan(20000);
            const achievementsPostCalc = await Achievement.find();
            expect(achievementsPreRecalc).toEqual(achievementsPostCalc);
        }
    );

    test("getAchievementOfPlayerOrCreate", async () => {
        const existingAchievement = await AchievementController.getAchievementOfPlayerOrCreate(
            "564c9a2f-88df-46fa-9b93-9b1b9e5fd0d7",
            new RoulettePlayer()
        );
        expect(existingAchievement).toEqual({
            "achievedAt": [
                1586977200000,
                1594494000000,
                1595624400000,
                1614697200000,
                1637352000000,
                1668528000000,
                1708704000000,
            ],
            "achievement": "Roulette Player",
            "data": 124,
            "match": [
                "b0062fbd-02e0-40d2-a5f7-2e1c4045aa0b",
                "e1a12b53-fe13-4712-a57f-d3e9ad4f22a3",
                "cfd52644-854c-4fba-9d18-883381715fb4",
                "9b8219b1-88e2-4eca-8d65-ee6ae8d210a8",
                "058f6d07-5bd0-4439-a583-84bc0945c2a4",
                "20742c74-b7f6-425e-945d-28a7b9a4f7b2",
                "de7b5cdb-8601-46b0-821d-efe7d7ea9cb9",
            ],
            "player": "564c9a2f-88df-46fa-9b93-9b1b9e5fd0d7",
            "progression": [
                1,
                1,
                1,
                1,
                1,
                1,
                1,
            ],
            "progressionString": [
                "124 / 1",
                "124 / 5",
                "124 / 10",
                "124 / 25",
                "124 / 50",
                "124 / 75",
                "124 / 100",
            ],
            "verified": true,
        });

        const newAchievement = await AchievementController.getAchievementOfPlayerOrCreate(
            "nonexistant-player",
            new RoulettePlayer()
        );
        expect(newAchievement).toEqual({
            "achievedAt": [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
            ],
            "achievement": "Roulette Player",
            "data": 0,
            "match": undefined,
            "player": "nonexistant-player",
            "progression": [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
            ],
            "progressionString": undefined,
            "verified": true,
        });
    });

    test("getAchievementsOfPlayer", async () => {
        const achievements = await AchievementController.getAchievementsOfPlayer("564c9a2f-88df-46fa-9b93-9b1b9e5fd0d7");
        expect(achievements.length).toEqual(79);
        const achievedAchievements = achievements.filter((achievement) => {
            return achievement.achievedAt[0] > 0
        });
        expect(achievedAchievements.length).toEqual(67);
    });

    test("updateAchievements", async () => {
        const saveMock = vi.spyOn(Achievement.prototype, "save");
        saveMock.mockResolvedValue(new Achievement());
        const automaticAchievementMocks: MockInstance<(m: Match, p1: Achievement, p2: Achievement) => Promise<void>>[] = [];
        for (const achievement of AchievementController.automaticAchievements) {
            const mock = vi.spyOn(achievement, "update");
            mock.mockResolvedValue();
            automaticAchievementMocks.push(mock);
        }

        const match = new Match();
        match.playerOne = "p1";
        match.playerTwo = "p2";
        await AchievementController.updateAchievements(match);

        expect(saveMock).toBeCalledTimes(AchievementController.automaticAchievements.length * 2);
        for (const mock of automaticAchievementMocks) {
            expect(mock).toBeCalledTimes(1);
        }
    });

    test("recalculateAllAchievements", async () => {
        const saveMock = vi.spyOn(Achievement.prototype, "save");
        saveMock.mockResolvedValue(new Achievement());
        const automaticAchievementMocks: MockInstance<(m: Match[], ach: Record<string, Achievement>,) => Promise<void>>[] = [];
        for (const achievement of AchievementController.automaticAchievements) {
            const mock = vi.spyOn(achievement, "recalculateAll");
            mock.mockResolvedValue();
            automaticAchievementMocks.push(mock);
        }

        await AchievementController.recalculateAllAchievements();
        const amountPlayers = await Player.count();

        expect(saveMock).toBeCalledTimes(AchievementController.automaticAchievements.length * amountPlayers);
        for (const mock of automaticAchievementMocks) {
            expect(mock).toBeCalledTimes(1);
        }
    });

    test("submitManualAchievement", async () => {
        const saveMock = vi.spyOn(Achievement.prototype, "save");
        saveMock.mockResolvedValue(new Achievement());
        const notifyMock = vi.spyOn(NotificationController, "sendManualAchievementSubmissionNotification");
        notifyMock.mockResolvedValue();

        expect(await AchievementController.submitManualAchievement("p1", "nonexistant", "no-vid", "no-comment")).toBe(false);

        expect(saveMock).toBeCalledTimes(0);
        expect(notifyMock).toBeCalledTimes(0);

        expect(await AchievementController.submitManualAchievement("p1", "Expertly Done", "no-vid", "no-comment")).toBe(true);
        expect(saveMock).toBeCalledTimes(1);
        expect(notifyMock).toBeCalledTimes(1);
    });

    test("getAchievementStatistics", async () => {
        const stats = await AchievementController.getAchievementStatistics();

        expect.soft(stats["Roulette Player"]).toEqual([
            0.029535864978902954,
            0.05063291139240506,
            0.11392405063291139,
            0.2616033755274262,
            0.5147679324894515,
            0.6962025316455697,
            1
        ]);
        expect.soft(stats["Spin the Wheel"]).toEqual([
            0.012658227848101266,
            0.029535864978902954,
            0.08438818565400844,
            0.20675105485232068,
            0.350210970464135,
            0.5358649789029536,
            0.8607594936708861
        ]);
        expect.soft(stats["Getting Mileage"]).toEqual([
            0.03375527426160337,
            0.10970464135021098,
            0.16877637130801687,
            0.2869198312236287,
            0.5147679324894515
        ]);
        expect.soft(stats["Open Season"]).toEqual([
            0,
            0.02109704641350211,
            0.046413502109704644,
            0.16033755274261605,
            0.5147679324894515
        ]);
        expect.soft(stats["Globetrotter"]).toEqual([
            0.012658227848101266,
            0.0759493670886076,
            0.21940928270042195
        ]);
        expect.soft(stats["Returning Rival"]).toEqual([
            0.008438818565400843,
            0.046413502109704644,
            0.11392405063291139,
            0.31223628691983124,
            0.6455696202531646
        ]);
        expect.soft(stats["Against the World"]).toEqual([
            0.04219409282700422,
            0.0759493670886076,
            0.14767932489451477,
            0.29957805907172996,
            0.6118143459915611
        ]);
        
        expect.soft(stats["Points for You"]).toEqual([
            0.016877637130801686,
            0.09282700421940929,
            0.18565400843881857,
            0.31645569620253167,
            0.4810126582278481,
            0.5864978902953587,
            0.8016877637130801
        ]);
        expect.soft(stats["Cutting Edge"]).toEqual([0.759493670886076]);
        expect.soft(stats["Dressed for the Occasion"]).toEqual([0.5738396624472574]);
        expect.soft(stats["Kaboom"]).toEqual([0.6371308016877637]);
        expect.soft(stats["Waiting to Happen"]).toEqual([0.6962025316455697]);
        expect.soft(stats["One of a Kind"]).toEqual([0.7215189873417721]);
        expect.soft(stats["Remember, No Pacify"]).toEqual([0.350210970464135]);
        expect.soft(stats["Why's it Spicy?"]).toEqual([0.5738396624472574]);
        expect.soft(stats["Worth a Shot"]).toEqual([0.7046413502109705]);
        expect.soft(stats["I Hate That Map"]).toEqual([0.008438818565400843]);
        expect.soft(stats["I Love That Map"]).toEqual([0.016877637130801686]);
        expect.soft(stats["History Repeats Itself"]).toEqual([
            0.02531645569620253,
            0.14767932489451477,
            0.32489451476793246
        ]);
        expect.soft(stats["Globally Innovative"]).toEqual([
            0.02109704641350211,
            0.06751054852320675,
            0.25316455696202533
        ]);
        expect.soft(stats["World of Assassination"]).toEqual([0.008438818565400843, 0.04219409282700422, 0.1308016877637131]);
        expect.soft(stats["The House Edge"]).toEqual([0.7215189873417721]);
        expect.soft(stats["Against All Odds"]).toEqual([0.7383966244725738]);
        expect.soft(stats["Beat the House"]).toEqual([0.20253164556962025]);
        expect.soft(stats["No Weaknesses"]).toEqual([0.02531645569620253]);

        expect.soft(stats["Rolf Lured"]).toEqual([0.16455696202531644]);
        expect.soft(stats["The Small Five"]).toEqual([0.05063291139240506]);
        expect.soft(stats["Partners Down"]).toEqual([0.29957805907172996]);
        expect.soft(stats["Chris X 3"]).toEqual([0.29957805907172996]);
        expect.soft(stats["Family Matters"]).toEqual([0.31645569620253167]);
        expect.soft(stats["Over the Hump"]).toEqual([0.24050632911392406]);
        expect.soft(stats["Land of the Free"]).toEqual([0.20675105485232068]);
        
        expect.soft(stats["Overtime"]).toEqual([
            0.02531645569620253,
            0.046413502109704644,
            0.10548523206751055,
            0.23628691983122363,
            0.41350210970464135
        ]);
        expect.soft(stats["Giant Killer"]).toEqual([0.2320675105485232]);
        expect.soft(stats["Behemoth Killer"]).toEqual([0.13924050632911392]);
        expect.soft(stats["Apex Predator"]).toEqual([0.05063291139240506]);
        expect.soft(stats["Best Served Cold"]).toEqual([0.25316455696202533]);
        expect.soft(stats["Comeback Story"]).toEqual([0.1308016877637131]);
        expect.soft(stats["Sweeper"]).toEqual([0.4092827004219409]);
        expect.soft(stats["Reversal"]).toEqual([0.08016877637130802]);
        expect.soft(stats["The Roulette Rival"]).toEqual([0.016877637130801686, 0.08860759493670886, 0.25316455696202533]);
        expect.soft(stats["Spin to Win"]).toEqual([
            0,
            0.02109704641350211,
            0.0379746835443038,
            0.12658227848101267,
            0.28270042194092826,
            0.4092827004219409,
            0.7046413502109705
        ]);
        expect.soft(stats["World-Renowned"]).toEqual([0.1308016877637131]);

        expect.soft(stats["Skill-Based Matchmaking"]).toEqual([0.05485232067510549, 0.10126582278481013, 0.21940928270042195]);
        expect.soft(stats["On a Roll"]).toEqual([0.03375527426160337, 0.09282700421940929, 0.3628691983122363]);
        expect.soft(stats["On a Streak"]).toEqual([0.03375527426160337, 0.17721518987341772, 0.5316455696202531]);
        expect.soft(stats["On a Mission"]).toEqual([0.05063291139240506, 0.22362869198312235, 0.5738396624472574]);
        expect.soft(stats["Stay-Cation"]).toEqual([0.5443037974683544]);
        expect.soft(stats["Double Down"]).toEqual([0.21518987341772153]);
        expect.soft(stats["The Encore"]).toEqual([0.04219409282700422]);
        expect.soft(stats["A Full Calendar"]).toEqual([0.24472573839662448]);
        expect.soft(stats["Guess Who's Back"]).toEqual([0.04219409282700422, 0.1729957805907173, 0.379746835443038]);

        expect.soft(stats["Speedrunner"]).toEqual([0.23628691983122363]);
        expect.soft(stats["Trilogy Speedrunner"]).toEqual([0.1518987341772152]);
        expect.soft(stats["Perfecting the Craft"]).toEqual([0.38396624472573837]);
        expect.soft(stats["For the Record"]).toEqual([0.25738396624472576]);
        expect.soft(stats["Timekeeper"]).toEqual([0.05063291139240506]);
        expect.soft(stats["Scratched Record"]).toEqual([0.0379746835443038]);
        expect.soft(stats["Master of None"]).toEqual([0.08860759493670886]);

        expect.soft(stats["Fall into Place"]).toEqual([0.11392405063291139, 0.13924050632911392, 0.25316455696202533, 0.45147679324894513, 0.7974683544303798]);
        expect.soft(stats["Champion"]).toEqual([0.05063291139240506]);
        expect.soft(stats["World Champion"]).toEqual([0.016877637130801686]);
        expect.soft(stats["All-Rounder"]).toEqual([0.012658227848101266]);
        expect.soft(stats["Challenger & Defender"]).toEqual([0.02109704641350211]);
        expect.soft(stats["The Culling"]).toEqual([0.32489451476793246]);
        expect.soft(stats["Title Contender"]).toEqual([0.0759493670886076]);
        expect.soft(stats["Untouchable"]).toEqual([0.008438818565400843]);
        expect.soft(stats["Beaten the Best"]).toEqual([0.008438818565400843, 0.08438818565400844, 0.22362869198312235]);
        expect.soft(stats["Rarified Air"]).toEqual([0.008438818565400843, 0.06751054852320675, 0.15611814345991562]);

        expect.soft(stats["Expertly Done"]).toEqual([0]);
        expect.soft(stats["One Stone"]).toEqual([0]);
        expect.soft(stats["Down to the Wire"]).toEqual([0]);
        expect.soft(stats["Up to the Wire"]).toEqual([0]);
        expect.soft(stats["The Wire"]).toEqual([0]);
        expect.soft(stats["Generous Benefactor"]).toEqual([0]);
        expect.soft(stats["The Constant"]).toEqual([0]);
        expect.soft(stats["Record Holder"]).toEqual([0]);
        expect.soft(stats["Record Smasher"]).toEqual([0]);
        expect.soft(stats["A Seed to Avoid"]).toEqual([0]);
    });
});