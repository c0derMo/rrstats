import { afterEach, describe, expect, test, vi, afterAll } from "vitest";

describe("useNavigatorInfo()", () => {
    const { $fetchMock } = vi.hoisted(() => {
        const mock = vi.fn();
        vi.stubGlobal("$fetch", mock);
        return {
            $fetchMock: mock,
        };
    });

    afterEach(() => {
        vi.resetAllMocks();
        clearNuxtState(["navigator"]);
    });

    afterAll(() => {
        vi.unstubAllGlobals();
    });

    test("getPlayers", async () => {
        const navigatorInfo = useNavigatorInfo();

        $fetchMock.mockResolvedValueOnce(["Player A", "Player B", "Player C"]);

        const result = await navigatorInfo.getPlayers();

        expect($fetchMock).toHaveBeenCalledTimes(1);
        expect($fetchMock).toHaveBeenCalledWith("/api/player/list");
        expect(result).toEqual(["Player A", "Player B", "Player C"]);
    });

    test("getCompetitions", async () => {
        const navigatorInfo = useNavigatorInfo();

        $fetchMock.mockResolvedValueOnce(["Comp A", "Comp B", "Comp C"]);

        const result = await navigatorInfo.getCompetitions();

        expect($fetchMock).toHaveBeenCalledTimes(1);
        expect($fetchMock).toHaveBeenCalledWith("/api/competitions/list");
        expect(result).toEqual(["Comp A", "Comp B", "Comp C"]);
    });

    test("getPlayerLeaderboards", async () => {
        const navigatorInfo = useNavigatorInfo();

        $fetchMock.mockResolvedValueOnce([
            { name: "Map LB 1", category: "map" },
            { name: "Map LB 2", category: "map" },
            { name: "Player LB 1", category: "player" },
            { name: "Player LB 2", category: "player" },
            { name: "Country LB 1", category: "country" },
            { name: "Country LB 2", category: "country" },
        ]);

        const result = await navigatorInfo.getPlayerLeaderboards();

        expect($fetchMock).toHaveBeenCalledTimes(1);
        expect($fetchMock).toHaveBeenCalledWith("/api/leaderboards/list");

        expect(result).toEqual([
            { name: "Player LB 1", category: "player" },
            { name: "Player LB 2", category: "player" },
        ]);
    });

    test("getCountryLeaderboards", async () => {
        const navigatorInfo = useNavigatorInfo();

        $fetchMock.mockResolvedValueOnce([
            { name: "Map LB 1", category: "map" },
            { name: "Map LB 2", category: "map" },
            { name: "Player LB 1", category: "player" },
            { name: "Player LB 2", category: "player" },
            { name: "Country LB 1", category: "country" },
            { name: "Country LB 2", category: "country" },
        ]);

        const result = await navigatorInfo.getCountryLeaderboards();

        expect($fetchMock).toHaveBeenCalledTimes(1);
        expect($fetchMock).toHaveBeenCalledWith("/api/leaderboards/list");
        expect(result).toEqual([
            { name: "Country LB 1", category: "country" },
            { name: "Country LB 2", category: "country" },
        ]);
    });

    test("getMapLeaderboards", async () => {
        const navigatorInfo = useNavigatorInfo();

        $fetchMock.mockResolvedValueOnce([
            { name: "Map LB 1", category: "map" },
            { name: "Map LB 2", category: "map" },
            { name: "Player LB 1", category: "player" },
            { name: "Player LB 2", category: "player" },
            { name: "Country LB 1", category: "country" },
            { name: "Country LB 2", category: "country" },
        ]);

        const result = await navigatorInfo.getMapLeaderboards();

        expect($fetchMock).toHaveBeenCalledTimes(1);
        expect($fetchMock).toHaveBeenCalledWith("/api/leaderboards/list");
        expect(result).toEqual([
            { name: "Map LB 1", category: "map" },
            { name: "Map LB 2", category: "map" },
        ]);
    });

    test("Get all leaderboards", async () => {
        const navigatorInfo = useNavigatorInfo();

        $fetchMock.mockResolvedValueOnce([
            { name: "Map LB 1", category: "map" },
            { name: "Map LB 2", category: "map" },
            { name: "Player LB 1", category: "player" },
            { name: "Player LB 2", category: "player" },
            { name: "Country LB 1", category: "country" },
            { name: "Country LB 2", category: "country" },
        ]);

        const maps = await navigatorInfo.getMapLeaderboards();
        const countrys = await navigatorInfo.getCountryLeaderboards();
        const players = await navigatorInfo.getPlayerLeaderboards();

        expect($fetchMock).toHaveBeenCalledTimes(1);
        expect($fetchMock).toHaveBeenCalledWith("/api/leaderboards/list");
        expect(maps).toEqual([
            { name: "Map LB 1", category: "map" },
            { name: "Map LB 2", category: "map" },
        ]);
        expect(countrys).toEqual([
            { name: "Country LB 1", category: "country" },
            { name: "Country LB 2", category: "country" },
        ]);
        expect(players).toEqual([
            { name: "Player LB 1", category: "player" },
            { name: "Player LB 2", category: "player" },
        ]);
    });
});
