import { test, expect, vi, afterEach, describe } from "vitest";
import type { IMatch } from "~/utils/interfaces/IMatch";

describe("usePlayers()", () => {
    const { $fetchMock } = vi.hoisted(() => {
        return {
            $fetchMock: vi.fn(),
        };
    });
    vi.stubGlobal("$fetch", $fetchMock);

    afterEach(() => {
        vi.resetAllMocks();
        clearNuxtState(["players", "inversePlayers"]);
    });

    test("queryPlayers", async () => {
        const players = usePlayers();

        $fetchMock.mockResolvedValueOnce({
            uuidA: "playerA",
            uuidB: "playerB",
        });

        await players.queryPlayers(["uuidA", "uuidB"]);

        expect($fetchMock).toBeCalledTimes(1);
        expect($fetchMock).toBeCalledWith("/api/player/lookup", {
            query: { players: ["uuidA", "uuidB"] },
        });

        expect(players.get("uuidA")).toBe("playerA");
        expect(players.get("uuidB")).toBe("playerB");

        await players.queryPlayers(["uuidA", "uuidB"]);
        expect($fetchMock).toBeCalledTimes(1);
    });

    test("Large queryPlayers", async () => {
        const players = usePlayers();

        $fetchMock.mockResolvedValue({
            uuidA: "playerA",
            uuidB: "playerB",
        });

        const first50UUIDs = new Array(50)
            .fill("a")
            .map((_, idx) => `uuidA${idx}`);
        const second50UUIDs = new Array(50)
            .fill("b")
            .map((_, idx) => `uuidB${idx}`);
        const third36UUIDs = new Array(36)
            .fill("c")
            .map((_, idx) => `uuidC${idx}`);

        await players.queryPlayers([
            ...first50UUIDs,
            ...second50UUIDs,
            ...third36UUIDs,
        ]);

        expect($fetchMock).toBeCalledTimes(3);
        expect($fetchMock).toHaveBeenNthCalledWith(3, "/api/player/lookup", {
            query: { players: first50UUIDs },
        });
        expect($fetchMock).toHaveBeenNthCalledWith(2, "/api/player/lookup", {
            query: { players: second50UUIDs },
        });
        expect($fetchMock).toHaveBeenNthCalledWith(1, "/api/player/lookup", {
            query: { players: third36UUIDs },
        });
    });

    test("queryAll", async () => {
        const players = usePlayers();

        $fetchMock.mockResolvedValueOnce({
            uuidA: "playerA",
            uuidB: "playerB",
        });

        await players.queryAll();
        expect($fetchMock).toBeCalledTimes(1);
        expect($fetchMock).toBeCalledWith("/api/player/lookup");

        await players.queryAll();
        expect($fetchMock).toBeCalledTimes(1);

        await players.queryPlayers(["uuidC", "uuidD"]);
        expect($fetchMock).toBeCalledTimes(1);
    });

    test("get", async () => {
        const players = usePlayers();

        $fetchMock.mockResolvedValueOnce({
            uuidA: "playerA",
            uuidB: "playerB",
        });

        await players.queryPlayers(["uuidA", "uuidB"]);

        expect(players.get("uuidA")).toBe("playerA");
        expect(players.get("uuidB")).toBe("playerB");
        expect(players.get("uuidC")).toBe("Unknown player: uuidC");
        expect(players.get("uuidC", "Default")).toBe("Default");
    });

    test("getUUID", async () => {
        const players = usePlayers();

        $fetchMock.mockResolvedValueOnce({
            uuidA: "playerA",
            uuidB: "playerB",
        });

        await players.queryPlayers(["uuidA", "uuidB"]);

        expect(players.getUUID("playerA")).toBe("uuidA");
        expect(players.getUUID("playerB")).toBe("uuidB");
        expect(players.getUUID("playerC")).toBe(undefined);
        expect(players.getUUID("playerC", "Default")).toBe("Default");
    });

    test("queryAndGet", async () => {
        const players = usePlayers();

        $fetchMock.mockResolvedValueOnce({
            uuidA: "playerA",
            uuidB: "playerB",
        });

        const resolvedPlayers = await players.queryAndGet([
            "uuidA",
            "uuidB",
            "uuidC",
        ]);

        expect($fetchMock).toBeCalledTimes(1);
        expect($fetchMock).toBeCalledWith("/api/player/lookup", {
            query: { players: ["uuidA", "uuidB", "uuidC"] },
        });

        expect(resolvedPlayers).toEqual([
            "playerA",
            "playerB",
            "Unknown player: uuidC",
        ]);
    });

    test("queryFromMatches", async () => {
        const players = usePlayers();

        $fetchMock.mockResolvedValueOnce({
            uuidA: "playerA",
            uuidB: "playerB",
        });

        const matches: IMatch[] = [
            {
                uuid: "",
                timestamp: 0,
                hitmapsMatchId: "",
                playerOne: "uuidA",
                playerTwo: "uuidB",
                playerOneScore: 0,
                playerTwoScore: 0,
                playedMaps: [],
                bannedMaps: [],
                round: "",
                competition: "",
            },
            {
                uuid: "",
                timestamp: 0,
                hitmapsMatchId: "",
                playerOne: "uuidB",
                playerTwo: "uuidA",
                playerOneScore: 0,
                playerTwoScore: 0,
                playedMaps: [],
                bannedMaps: [],
                round: "",
                competition: "",
            },
            {
                uuid: "",
                timestamp: 0,
                hitmapsMatchId: "",
                playerOne: "uuidC",
                playerTwo: "uuidD",
                playerOneScore: 0,
                playerTwoScore: 0,
                playedMaps: [],
                bannedMaps: [],
                round: "",
                competition: "",
            },
        ];
        await players.queryFromMatches(matches);

        expect($fetchMock).toBeCalledTimes(1);
        expect($fetchMock).toBeCalledWith("/api/player/lookup", {
            query: { players: ["uuidA", "uuidB", "uuidC", "uuidD"] },
        });
    });
});
