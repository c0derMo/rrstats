import type {
    HitmapsMatch,
    HitmapsTournamentMatch,
} from "../controller/integrations/HitmapsIntegration";
import { ofetch } from "ofetch";

interface GameModeMatchIdHitmapsTournamentMatch extends HitmapsTournamentMatch {
    gameModeMatchId: string;
}

interface NewHitmapsTournamentMatch extends HitmapsTournamentMatch {
    maps: {
        competitorId: number;
        competitorName: string;
        selectionType: "Ban" | "Pick" | "Random";
        mapSlug: string;
        mapStartedAt: string;
        resultVerifiedAt?: string;
        winnerFinishedAt?: string;
        winnerDiscordId?: string;
        mapJson: string;
        roundType: string;
        state: string;
    }[];
}

const tournamentToQuery = "rr14";

async function main() {
    const matchHistory = await ofetch<{ matches: HitmapsTournamentMatch[] }>(
        `https://tournamentsapi.hitmaps.com/api/events/${tournamentToQuery}/statistics?statsKey=MatchHistory`,
    );

    const sorted = sort(matchHistory.matches);

    console.log(
        `Queried ${matchHistory.matches.length} matches, ${sorted.matchId.length} old ones and ${sorted.newVersion.length} new ones`,
    );

    const results: string[] = [];

    for (const match of sorted.newVersion) {
        for (const map of match.maps) {
            if (map.selectionType === "Ban" || map.state !== "Complete") {
                continue;
            }

            if (map.winnerFinishedAt == null) {
                if (map.winnerDiscordId == null) {
                    results.push(
                        `${match.competitors[0].challongeName} - ${match.competitors[1].challongeName} - ${match.round}: Map ${map.mapSlug} has no winner time, but ended in a draw.`,
                    );
                } else {
                    results.push(
                        `!! ${match.competitors[0].challongeName} - ${match.competitors[1].challongeName} - ${match.round}: Map ${map.mapSlug} has no winner time, but didn't in a draw!`,
                    );
                }
            }
        }
    }

    console.log("Handled new matches");

    const detailedMatches = await fetchHitmapsMatches(
        sorted.matchId.map((m) => m.gameModeMatchId),
    );

    for (const match of sorted.matchId) {
        const detailedMatch = detailedMatches.find(
            (dm) => dm.matchupId === match.gameModeMatchId,
        );
        if (detailedMatch == null) {
            console.log(`MATCH ${match.id} HAS NO DETAILED MATCH`);
            continue;
        }

        for (const map of detailedMatch.mapSelections) {
            if (!map.complete) {
                continue;
            }
            if (map.winnerFinishedAt == null) {
                if (map.winnerName == null) {
                    results.push(
                        `${match.competitors[0].challongeName} - ${match.competitors[1].challongeName} - ${match.round}: Map ${map.hitmapsSlug} has no winner time, but ended in a draw.`,
                    );
                } else {
                    results.push(
                        `!! ${match.competitors[0].challongeName} - ${match.competitors[1].challongeName} - ${match.round}: Map ${map.hitmapsSlug} has no winner time, but didn't in a draw!`,
                    );
                }
            }
        }
    }

    console.log("Handled old matches");

    for (const issue of results) {
        console.log(issue);
    }
}

function sort(matches: HitmapsTournamentMatch[]): {
    matchId: GameModeMatchIdHitmapsTournamentMatch[];
    newVersion: NewHitmapsTournamentMatch[];
} {
    const result = {
        matchId: [] as GameModeMatchIdHitmapsTournamentMatch[],
        newVersion: [] as NewHitmapsTournamentMatch[],
    };

    for (const match of matches) {
        const filteredMaps = match.maps.filter((map) => {
            return map.selectionType !== "Ban" && map.state === "Complete";
        });

        if (
            filteredMaps.length > 0 &&
            filteredMaps.every((map) => {
                return map.mapStartedAt != null && map.mapJson != null;
            })
        ) {
            result.newVersion.push(match as NewHitmapsTournamentMatch);
            continue;
        }

        if (
            match.gameModeMatchId != null &&
            match.gameModeMatchId !== "00000000-0000-0000-0000-000000000000"
        ) {
            result.matchId.push(match as GameModeMatchIdHitmapsTournamentMatch);
        }
    }

    return result;
}

async function fetchHitmapsMatches(
    hitmapsMatchIds: string[],
): Promise<HitmapsMatch[]> {
    if (hitmapsMatchIds.length <= 0) {
        return [];
    }
    if (hitmapsMatchIds.length > 200) {
        const listOne = hitmapsMatchIds.slice(0, 200);
        const listTwo = hitmapsMatchIds.slice(200);
        return (await fetchHitmapsMatches(listOne)).concat(
            await fetchHitmapsMatches(listTwo),
        );
    }
    const listOfMatches = hitmapsMatchIds.join(",");

    try {
        const request = await ofetch<{ matches: HitmapsMatch[] }>(
            `https://rouletteapi.hitmaps.com/api/match-history?matchIds=${listOfMatches}`,
        );
        return request.matches;
    } catch {
        return [];
    }
}

void main();
