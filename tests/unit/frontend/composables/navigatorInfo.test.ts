import { afterEach, describe, expect, test, vi } from "vitest";

describe("useNavigatorInfo()", () => {
    const { $fetchMock } = vi.hoisted(() => {
        return {
            $fetchMock: vi.fn(),
        };
    });
    vi.stubGlobal("$fetch", $fetchMock);

    afterEach(() => {
        vi.resetAllMocks();
        clearNuxtState(["navigator"]);
    });

    test("getPlayers", async () => {
        const navigatorInfo = useNavigatorInfo();

        $fetchMock.mockResolvedValueOnce(["Player A", "Player B", "Player C"]);

        const result = await navigatorInfo.getPlayers();

        expect($fetchMock).toBeCalledTimes(1);
        expect($fetchMock).toBeCalledWith("/api/player/list");
        expect(result).toEqual(["Player A", "Player B", "Player C"]);
    });

    test("getCompetitions", async () => {
        const navigatorInfo = useNavigatorInfo();

        $fetchMock.mockResolvedValueOnce(["Comp A", "Comp B", "Comp C"]);

        const result = await navigatorInfo.getCompetitions();

        expect($fetchMock).toBeCalledTimes(1);
        expect($fetchMock).toBeCalledWith("/api/competitions/list");
        expect(result).toEqual(["Comp A", "Comp B", "Comp C"]);
    });

    test("getPlayerLeaderboards", async () => {
        const navigatorInfo = useNavigatorInfo();

        $fetchMock.mockResolvedValueOnce({
            map: ["Map LB 1", "Map LB 2"],
            player: ["Player LB 1", "Player LB 2"],
            country: ["Country LB 1", "Country LB 2"],
        });

        const result = await navigatorInfo.getPlayerLeaderboards();

        expect($fetchMock).toBeCalledTimes(1);
        expect($fetchMock).toBeCalledWith("/api/leaderboards/list");
        expect(result).toEqual(["Player LB 1", "Player LB 2"]);
    });

    test("getCountryLeaderboards", async () => {
        const navigatorInfo = useNavigatorInfo();

        $fetchMock.mockResolvedValueOnce({
            map: ["Map LB 1", "Map LB 2"],
            player: ["Player LB 1", "Player LB 2"],
            country: ["Country LB 1", "Country LB 2"],
        });

        const result = await navigatorInfo.getCountryLeaderboards();

        expect($fetchMock).toBeCalledTimes(1);
        expect($fetchMock).toBeCalledWith("/api/leaderboards/list");
        expect(result).toEqual(["Country LB 1", "Country LB 2"]);
    });

    test("getMapLeaderboards", async () => {
        const navigatorInfo = useNavigatorInfo();

        $fetchMock.mockResolvedValueOnce({
            map: ["Map LB 1", "Map LB 2"],
            player: ["Player LB 1", "Player LB 2"],
            country: ["Country LB 1", "Country LB 2"],
        });

        const result = await navigatorInfo.getMapLeaderboards();

        expect($fetchMock).toBeCalledTimes(1);
        expect($fetchMock).toBeCalledWith("/api/leaderboards/list");
        expect(result).toEqual(["Map LB 1", "Map LB 2"]);
    });

    test("Get all leaderboards", async () => {
        const navigatorInfo = useNavigatorInfo();

        $fetchMock.mockResolvedValueOnce({
            map: ["Map LB 1", "Map LB 2"],
            player: ["Player LB 1", "Player LB 2"],
            country: ["Country LB 1", "Country LB 2"],
        });

        const maps = await navigatorInfo.getMapLeaderboards();
        const countrys = await navigatorInfo.getCountryLeaderboards();
        const players = await navigatorInfo.getPlayerLeaderboards();

        expect($fetchMock).toBeCalledTimes(1);
        expect($fetchMock).toBeCalledWith("/api/leaderboards/list");
        expect(maps).toEqual(["Map LB 1", "Map LB 2"]);
        expect(countrys).toEqual(["Country LB 1", "Country LB 2"]);
        expect(players).toEqual(["Player LB 1", "Player LB 2"]);
    });
});
