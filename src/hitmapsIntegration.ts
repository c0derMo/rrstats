import {database} from "./databaseManager";
import {RRMatch} from "./models/Match";
import {In} from "typeorm";
import {getHitmapsMatches} from "./httpClient";

export interface HitmapsTournamentMatch {
    id: number;
    challongeMatchId: number;
    matchScheduledAt: string;
    matchCompletedAt: string;
    competitors: {
        id: number;
        bracketId: number;
        discordId: string;
        challongePlayerId: number;
        challongeName: string;
        countryCode: string;
    }[];
    gameModeMatchId: string;
    maps: {
        competitorId: number;
        competitorName: string;
        selectionType: "Ban" | "Pick" | "Random";
        mapSlug: string;
    }[]
}

export interface HitmapsMatch {
    matchupId: string;
    participants: {
        publicId: string;
        name: string;
        avatarUrl: string;
        lastPing: string;
        completeTime: null;
        forfeit: boolean;
    }[];
    mapSelections: {
        id: string;
        hitmapsSlug: string;
        chosenByName: string;
        complete: boolean;
        winnerName: string;
    }[]
}

export async function parseHitmapsTournaments(matches: HitmapsTournamentMatch[]) {

    // For each match: check if already exists in database
    const existingMatches = await database.getRepository(RRMatch).findBy({
        hitmapsMatchId: In(matches.map(m => m.gameModeMatchId))
    });

    if (existingMatches.length === matches.length) {
        // All the "new" matches are already in the database, no need to re-query
        return;
    }

    // If not: re-query using other link
    const matchesToQuery = matches.filter((rawMatch) => {
        const m = existingMatches.findIndex((dbMatch) => {
            return dbMatch.hitmapsMatchId === rawMatch.gameModeMatchId;
        });
        return m >= 0;
    });

    const hitmapsMatches = await getHitmapsMatches(matchesToQuery.map(m => m.gameModeMatchId));

}