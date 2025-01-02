import { afterEach, beforeEach, describe, test, expect, vi } from "vitest";
import DatabaseConnector from "~/server/controller/DatabaseConnnector";
import newSchemaResponse from "./matchHistory-newSchema.json";
import oldSchemaResponse from "./matchHistory-oldSchema.json";
import oldSchemaMatch from "./oldSchema-match.json";
import { Player } from "~/server/model/Player";
import { Match } from "~/server/model/Match";
import { Competition } from "~/server/model/Competition";
import { PlayedMap } from "~/server/model/PlayedMap";
import HitmapsIntegration from "~/server/controller/integrations/HitmapsIntegration";
import { ChoosingPlayer, WinningPlayer } from "~/utils/interfaces/IMatch";
import consola from "consola";

let database: DatabaseConnector;

describe("PlayerStatisticController", () => {
    const { $fetchMock } = vi.hoisted(() => {
        return {
            $fetchMock: vi.fn(),
        };
    });
    vi.stubGlobal("$fetch", $fetchMock);

    beforeEach(async () => {
        database = new DatabaseConnector("sqlite", ":memory:", false);
        await database.initialize();
        consola.level = 0;
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

        const parapluie = new Player();
        parapluie.primaryName = "Parapluie";
        parapluie.alternativeNames = [];
        parapluie.discordId = "664320213700968478";
        await parapluie.save();

        const deinNomos = new Player();
        deinNomos.primaryName = "Dein Nomos";
        deinNomos.alternativeNames = [];
        deinNomos.discordId = "203595409623351296";
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

        expect($fetchMock).toBeCalledTimes(1);
        expect($fetchMock).toHaveBeenNthCalledWith(
            1,
            "https://tournamentsapi.hitmaps.com/api/events/test-wc-2024/statistics?statsKey=MatchHistory",
        );

        expect(await Match.count()).toBe(1);

        const match = await Match.findOneByOrFail({
            hitmapsMatchId: "3f34b025-42d5-41e2-b4e6-11e0ad37b6fa",
        });

        expect(match).toMatchObject({
            hitmapsMatchId: "3f34b025-42d5-41e2-b4e6-11e0ad37b6fa",
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
        });
    });

    test("Hitmaps Integration - Old Schema", async () => {
        $fetchMock.mockResolvedValueOnce(oldSchemaResponse);
        $fetchMock.mockResolvedValueOnce(oldSchemaMatch);

        expect(await Player.count()).toBe(0);
        expect(await Match.count()).toBe(0);
        expect(await Competition.count()).toBe(0);
        expect(await PlayedMap.count()).toBe(0);

        const comp = new Competition();
        comp.tag = "TC";
        comp.name = "Test Comp";
        comp.officialCompetition = false;
        comp.startingTimestamp = 0;
        comp.matchTimeoutTime = 3600;
        await comp.save();

        await HitmapsIntegration.updateHitmapsTournament("test", "TC");

        expect($fetchMock).toBeCalledTimes(2);
        expect($fetchMock).toHaveBeenNthCalledWith(
            1,
            "https://tournamentsapi.hitmaps.com/api/events/test/statistics?statsKey=MatchHistory",
        );
        expect($fetchMock).toHaveBeenNthCalledWith(
            2,
            "https://rouletteapi.hitmaps.com/api/match-history?matchIds=a7d655fc-49b6-48a6-9ab8-8a28e40d4614",
        );

        expect(await Player.count()).toBe(2);
        expect(await Match.count()).toBe(1);

        const curryMaker = await Player.findOneByOrFail({
            primaryName: "CurryMaker",
        });
        const apricope = await Player.findOneByOrFail({
            primaryName: "Apricope",
        });

        const match = await Match.findOneByOrFail({
            hitmapsMatchId: "a7d655fc-49b6-48a6-9ab8-8a28e40d4614",
        });

        expect(match).toMatchObject({
            hitmapsMatchId: "a7d655fc-49b6-48a6-9ab8-8a28e40d4614",
            timestamp: 1715436000000,
            playerOne: curryMaker.uuid,
            playerTwo: apricope.uuid,
            playerOneScore: 2,
            playerTwoScore: 6,
            competition: "TC",
            round: "Round 1",
            bannedMaps: [
                { map: HitmanMap.CHONGQING, picked: ChoosingPlayer.PLAYER_ONE },
                { map: HitmanMap.BANGKOK, picked: ChoosingPlayer.PLAYER_TWO },
            ],
            playedMaps: [
                {
                    map: HitmanMap.MENDOZA,
                    picked: ChoosingPlayer.PLAYER_ONE,
                    winner: WinningPlayer.PLAYER_ONE,
                    index: 0,
                    timeTaken: 556,
                    spin: oldSchemaMatch.matches[0].mapSelections[0].spin,
                },
                {
                    map: HitmanMap.MUMBAI,
                    picked: ChoosingPlayer.PLAYER_TWO,
                    winner: WinningPlayer.PLAYER_TWO,
                    index: 1,
                    timeTaken: 885,
                    spin: oldSchemaMatch.matches[0].mapSelections[1].spin,
                },
                {
                    map: HitmanMap.MIAMI,
                    picked: ChoosingPlayer.RANDOM,
                    winner: WinningPlayer.PLAYER_TWO,
                    index: 2,
                    timeTaken: 766,
                    spin: oldSchemaMatch.matches[0].mapSelections[2].spin,
                },
                {
                    map: HitmanMap.SAPIENZA,
                    picked: ChoosingPlayer.RANDOM,
                    winner: WinningPlayer.PLAYER_TWO,
                    index: 3,
                    timeTaken: 427,
                    spin: oldSchemaMatch.matches[0].mapSelections[3].spin,
                },
            ],
        });
    });
});
