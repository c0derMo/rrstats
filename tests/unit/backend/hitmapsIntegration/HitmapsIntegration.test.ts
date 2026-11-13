import { afterEach, beforeEach, describe, test, expect, vi } from "vitest";
import DatabaseConnector from "~~/server/controller/DatabaseConnnector";
import newSchemaResponse from "./matchHistory-newSchema.json";
import { Player } from "~~/server/model/Player";
import { Match } from "~~/server/model/Match";
import { Competition } from "~~/server/model/Competition";
import { PlayedMap } from "~~/server/model/PlayedMap";
import HitmapsIntegration from "~~/server/controller/integrations/HitmapsIntegration";
import consola from "consola";

let database: DatabaseConnector;

const { $fetchMock } = vi.hoisted(() => {
    const mock = vi.fn();
    vi.stubGlobal("$fetch", mock);
    return {
        $fetchMock: mock,
    };
});

describe("HitmapsIntegration", () => {
    beforeEach(async () => {
        database = new DatabaseConnector("sqlite", ":memory:", false);
        await database.initialize();
        consola.level = +999;
        vi.resetAllMocks();
    });
    afterEach(async () => {
        await database.destroy();
    });

    test("Hitmaps Integration - New Schema", async () => {
        $fetchMock.mockResolvedValueOnce(newSchemaResponse);

        expect(await Player.count()).toBe(0);
        expect(await Match.count()).toBe(0);
        expect(await Competition.count()).toBe(0);
        expect(await PlayedMap.count()).toBe(0);

        const curryMaker = new Player();
        curryMaker.primaryName = "CurryMaker";
        curryMaker.alternativeNames = [];
        curryMaker.discordId = "292699566782939137";
        curryMaker.accolade = "Roulette Rookie";
        curryMaker.defaultAccolade = "Roulette Rookie";
        await curryMaker.save();

        const in4Fun = new Player();
        in4Fun.primaryName = "In4Fun";
        in4Fun.alternativeNames = [];
        in4Fun.discordId = "412288950854746113";
        in4Fun.accolade = "Roulette Rookie";
        in4Fun.defaultAccolade = "Roulette Rookie";
        await in4Fun.save();

        const parapluie = new Player();
        parapluie.primaryName = "Parapluie";
        parapluie.alternativeNames = [];
        parapluie.discordId = "664320213700968478";
        parapluie.accolade = "Roulette Rookie";
        parapluie.defaultAccolade = "Roulette Rookie";
        await parapluie.save();

        const deinNomos = new Player();
        deinNomos.primaryName = "Dein Nomos";
        deinNomos.alternativeNames = [];
        deinNomos.discordId = "203595409623351296";
        deinNomos.accolade = "Roulette Rookie";
        deinNomos.defaultAccolade = "Roulette Rookie";
        await deinNomos.save();

        const comp = new Competition();
        comp.tag = "TWC";
        comp.name = "Test World Championship";
        comp.officialCompetition = false;
        comp.startingTimestamp = 0;
        comp.matchTimeoutTime = 3600;
        comp.groupsConfig = {
            matchesBetweenPlayers: 1,
            maxPointsPerMatch: 6,
            groups: [
                {
                    advancingPlayers: 1,
                    groupName: "Group T",
                    players: [parapluie.uuid, deinNomos.uuid],
                    positionOverrides: {},
                },
            ],
        };
        await comp.save();

        await HitmapsIntegration.updateHitmapsTournament("test-wc-2024", "TWC");

        expect($fetchMock).toHaveBeenCalledTimes(1);
        expect($fetchMock).toHaveBeenNthCalledWith(
            1,
            "https://tournamentsapi.hitmaps.com/api/events/test-wc-2024/statistics?statsKey=MatchHistory",
        );

        expect(await Match.count()).toBe(1);

        const match = await Match.findOneByOrFail({
            hitmapsMatchId: "3379",
        });

        expect(match).toMatchObject({
            hitmapsMatchId: "3379",
            timestamp: 1729258200000,
            playerOne: parapluie.uuid,
            playerTwo: deinNomos.uuid,
            playerOneScore: 1,
            playerTwoScore: 5,
            competition: "TWC",
            round: "Group T",
            bannedMaps: [],
            playedMaps: [
                {
                    map: HitmanMap.MENDOZA,
                    picked: ChoosingPlayer.PLAYER_TWO,
                    winner: WinningPlayer.PLAYER_TWO,
                    index: 0,
                    timeTaken: 315,
                    spin: {},
                },
                {
                    map: HitmanMap.PARIS,
                    picked: ChoosingPlayer.PLAYER_ONE,
                    winner: WinningPlayer.DRAW,
                    index: 1,
                    timeTaken: 3600,
                    spin: {},
                },
                {
                    map: HitmanMap.MUMBAI,
                    picked: ChoosingPlayer.RANDOM,
                    winner: WinningPlayer.PLAYER_TWO,
                    index: 2,
                    timeTaken: 820,
                    spin: {},
                },
            ],
            shoutcasters: ["CurryMaker", "In4Fun"],
        });
    });
});
