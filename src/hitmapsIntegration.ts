import {database} from "./databaseManager";
import {IRRBan, IRRMap, RRMatch} from "./models/Match";
import {In} from "typeorm";
import {getHitmapsMatches} from "./httpClient";
import {RRCompetiton} from "./models/Competitions";
import {DateTime} from "luxon";
import {mapSlugToAbbreviation} from "./utils";

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
    }[];
    platform: string;
    round: number | null;
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

export async function parseHitmapsTournaments(matches: HitmapsTournamentMatch[], competition: RRCompetiton) {

    // For each match: check if already exists in database
    const existingMatches = await database.getRepository(RRMatch).find({
        where: { hitmapsMatchId: In(matches.map(m => m.gameModeMatchId)) },
        select: ['hitmapsMatchId']
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
        return m < 0;
    });

    if (matchesToQuery.length <= 0) {
        // We dont have any matches to query
        return;
    }

    const hitmapsMatches = await getHitmapsMatches(matchesToQuery.map(m => m.gameModeMatchId));

    // Create database matches for all matches that dont exist yet
    for (const newMatch of matchesToQuery) {
        const fullMatch = hitmapsMatches.find((m) => m.matchupId === newMatch.gameModeMatchId);
        if (fullMatch === undefined) throw new Error("Got hitmaps tournament match without detailed information");

        const dbMatch = new RRMatch();
        dbMatch.hitmapsMatchId = newMatch.gameModeMatchId;
        dbMatch.player1 = newMatch.competitors[0].challongeName.trim();
        dbMatch.player2 = newMatch.competitors[1].challongeName.trim();
        dbMatch.competition = competition.tag;
        dbMatch.round = "";
        dbMatch.timestamp = DateTime.fromISO(newMatch.matchScheduledAt).toMillis();

        if (newMatch.round !== null && newMatch.round !== undefined) {
            if (newMatch.round < 0) {
                dbMatch.round = `LB Round ${-newMatch.round}`;
            } else {
                dbMatch.round = `Round ${newMatch.round}`;
            }
        }

        if (newMatch.platform !== "All") {
            dbMatch.platform = newMatch.platform;
        }

        let p1Score = 0;
        let p2Score = 0;
        const maps = [] as IRRMap[];
        const bans = [] as IRRBan[];

        for (const map of fullMatch.mapSelections) {
            if (!map.complete) continue;
            let winner = 0;
            if (map.winnerName === fullMatch.participants[0].name) {
                winner = 1;
                p1Score += 2;
            } else if (map.winnerName === fullMatch.participants[1].name) {
                winner = 2;
                p2Score += 2;
            } else {
                p1Score += 1;
                p2Score += 1;
            }
            let pickedBy = 0;
            if (map.chosenByName === fullMatch.participants[0].name) pickedBy = 1;
            if (map.chosenByName === fullMatch.participants[1].name) pickedBy = 2;

            maps.push({
                map: mapSlugToAbbreviation(map.hitmapsSlug),
                winner,
                pickedBy
            });
        }

        for (const map of newMatch.maps) {
            if (map.selectionType !== "Ban") continue;

            let pickedBy = 0;
            if (map.competitorId === newMatch.competitors[0].id) pickedBy = 1;
            if (map.competitorId === newMatch.competitors[1].id) pickedBy = 2;

            bans.push({
                map: mapSlugToAbbreviation(map.mapSlug),
                bannedBy: pickedBy
            })
        }

        let winner = 0;
        if (p1Score > p2Score) {
            winner = 1;
        } else if (p2Score > p1Score) {
            winner = 2;
        }

        dbMatch.score = {
            player1Points: p1Score,
            player2Points: p2Score,
            winner,
        };
        dbMatch.maps = maps;
        dbMatch.bans = bans;

        await database.getRepository(RRMatch).save(dbMatch);
    }

}