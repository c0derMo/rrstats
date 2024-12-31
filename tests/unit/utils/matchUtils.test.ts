import { expect, test } from "vitest";
import type { IMatch } from "~/utils/interfaces/IMatch";

function buildMatch(
    uuid: string,
    playerOneScore: number,
    playerTwoScore: number,
): IMatch {
    return {
        uuid,
        hitmapsMatchId: "",
        timestamp: 0,
        playerOne: "",
        playerTwo: "",
        playerOneScore,
        playerTwoScore,
        competition: "",
        round: "",
        bannedMaps: [],
        playedMaps: [],
    };
}

test("filterForfeitMatches", () => {
    const allMatches: IMatch[] = [
        buildMatch("a", 3, 4),
        buildMatch("b", 1, 0),
        buildMatch("c", 3, 3),
        buildMatch("d", 1, 1),
        buildMatch("e", 0, 1),
        buildMatch("f", 0, 0),
        buildMatch("g", 6, 0),
        buildMatch("h", 0, 4),
    ];

    const filteredMatches = filterForfeitMatches(allMatches);

    expect(filteredMatches.length).toBe(5);
    expect(filteredMatches.map((m) => m.uuid)).toEqual([
        "a",
        "c",
        "d",
        "g",
        "h",
    ]);
});
