import { database } from '../databaseManager';
import { newEntry } from '../models/AuditLogEntry';
import { RRMatch } from '../models/Match';
import { mapAbbreviationToArrayIndex } from '../utils';

interface PlayerRanking {
    rrCompetitions: string[];
    rrwcCompetitions: string[];
    matches: number;
    won: number;
    mapsPlayed: number[];
    mapsWon: number[];
    mostMatchesWonInARow: number;
    mostMapsWonInARow: number;
    matchesWithDecider: number;
    grandFinalAppearances: number;
    matchesWithoutGroups: number;
    deciderWin: number;
    ownMapsWon: number;
    ownMaps: number;
    opponentMaps: number;
    opponentMapsWon: number;
    mapsPlayedAmount: number;
    mapsWonAmount: number;
}

interface PlayerRankings {
    [key: string]: PlayerRanking;
}

let leaderboards = {} as PlayerRankings;

export async function recalculate(additionalMatches: RRMatch[]=[], username=""): Promise<void> {
    const rankings = {} as PlayerRankings;
    const matchWinningSprees = {} as { [key: string]: number };
    const mapWinningSprees = {} as { [key: string]: number };

    const storedMatches = await database.getRepository(RRMatch).find();
    const matches = [].concat(additionalMatches).concat(storedMatches) as RRMatch[];
    matches.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    for(const match of matches) {
        // Creating default player objects if they don't exist yet
        if(rankings[match.player1] === undefined) {
            rankings[match.player1] = getDefaultRankingObject();
            matchWinningSprees[match.player1] = 0;
            mapWinningSprees[match.player1] = 0;
        }
        if(rankings[match.player2] === undefined) {
            rankings[match.player2] = getDefaultRankingObject();
            matchWinningSprees[match.player2] = 0;
            mapWinningSprees[match.player2] = 0;
        }

        // Amount of RRWC and RR competitions
        if(!rankings[match.player1].rrCompetitions.includes(match.competition)) rankings[match.player1].rrCompetitions.push(match.competition);
        if(!rankings[match.player2].rrCompetitions.includes(match.competition)) rankings[match.player2].rrCompetitions.push(match.competition);
        if(match.competition.toLowerCase().indexOf("wc") >= 0) {
            if(!rankings[match.player1].rrwcCompetitions.includes(match.competition)) rankings[match.player1].rrwcCompetitions.push(match.competition);
            if(!rankings[match.player2].rrwcCompetitions.includes(match.competition)) rankings[match.player2].rrwcCompetitions.push(match.competition);
        }

        // Grand Final appearances
        if(match.round.toLowerCase().indexOf("grand final") >= 0) {
            rankings[match.player1].grandFinalAppearances += 1;
            rankings[match.player2].grandFinalAppearances += 1;
        }

        // Amount of matches played
        rankings[match.player1].matches += 1
        rankings[match.player2].matches += 1
        // TODO: Matches that went to a decider

        // Winrate & Winningspree
        if(match.score.winner === 1) {
            rankings[match.player1].won += 1;
            matchWinningSprees[match.player1] += 1;

            rankings[match.player2].mostMatchesWonInARow = Math.max(rankings[match.player2].mostMatchesWonInARow, matchWinningSprees[match.player2])
            matchWinningSprees[match.player2] = 0;
        } else if(match.score.winner === 2) {
            rankings[match.player2].won += 1;
            matchWinningSprees[match.player2] += 1;

            rankings[match.player1].mostMatchesWonInARow = Math.max(rankings[match.player1].mostMatchesWonInARow, matchWinningSprees[match.player1])
            matchWinningSprees[match.player1] = 0;
        } else {
            rankings[match.player1].won += 0.5;
            rankings[match.player2].won += 0.5;
            rankings[match.player2].mostMatchesWonInARow = Math.max(rankings[match.player2].mostMatchesWonInARow, matchWinningSprees[match.player2])
            matchWinningSprees[match.player2] = 0;
            rankings[match.player1].mostMatchesWonInARow = Math.max(rankings[match.player1].mostMatchesWonInARow, matchWinningSprees[match.player1])
            matchWinningSprees[match.player1] = 0;
        }

        // Per Map Stats
        for(const map of match.maps) {
            if (map.forfeit) {
                continue;
            }
            rankings[match.player1].mapsPlayedAmount += 1;
            rankings[match.player2].mapsPlayedAmount += 1;
            rankings[match.player1].mapsPlayed[mapAbbreviationToArrayIndex(map.map)] += 1
            rankings[match.player2].mapsPlayed[mapAbbreviationToArrayIndex(map.map)] += 1

            if(map.pickedBy === 1) {
                rankings[match.player1].ownMaps += 1
                rankings[match.player2].opponentMaps += 1
                if(map.winner === 1) {
                    rankings[match.player1].ownMapsWon += 1
                } else if(map.winner === 2) {
                    rankings[match.player2].opponentMapsWon += 1
                } else {
                    rankings[match.player2].opponentMapsWon += 0.5
                    rankings[match.player1].ownMapsWon += 0.5
                }
            } else if(map.pickedBy === 2) {
                rankings[match.player2].ownMaps += 1
                rankings[match.player1].opponentMaps += 1
                if(map.winner === 1) {
                    rankings[match.player1].opponentMapsWon += 1
                } else if(map.winner === 2) {
                    rankings[match.player2].ownMapsWon += 1
                } else {
                    rankings[match.player1].opponentMapsWon += 0.5
                    rankings[match.player2].ownMapsWon += 0.5
                }
            }
            
            if (map.winner === 1) {
                rankings[match.player1].mapsWon[mapAbbreviationToArrayIndex(map.map)] += 1
                rankings[match.player1].mapsWonAmount += 1

                mapWinningSprees[match.player1] += 1;
                rankings[match.player2].mostMapsWonInARow = Math.max(rankings[match.player2].mostMapsWonInARow, mapWinningSprees[match.player2]);
                mapWinningSprees[match.player2] = 0;
            } else if (map.winner === 2) {
                rankings[match.player2].mapsWon[mapAbbreviationToArrayIndex(map.map)] += 1
                rankings[match.player2].mapsWonAmount += 1

                mapWinningSprees[match.player2] += 1;
                rankings[match.player1].mostMapsWonInARow = Math.max(rankings[match.player1].mostMapsWonInARow, mapWinningSprees[match.player1]);
                mapWinningSprees[match.player1] = 0;
            } else {
                rankings[match.player1].mapsWon[mapAbbreviationToArrayIndex(map.map)] += 0.5
                rankings[match.player1].mapsWonAmount += 0.5
                rankings[match.player2].mapsWon[mapAbbreviationToArrayIndex(map.map)] += 0.5
                rankings[match.player2].mapsWonAmount += 0.5

                rankings[match.player1].mostMapsWonInARow = Math.max(rankings[match.player1].mostMapsWonInARow, mapWinningSprees[match.player1]);
                mapWinningSprees[match.player1] = 0;
                rankings[match.player2].mostMapsWonInARow = Math.max(rankings[match.player2].mostMapsWonInARow, mapWinningSprees[match.player2]);
                mapWinningSprees[match.player2] = 0;
            }
        }
    }

    for(const player in matchWinningSprees) {
        rankings[player].mostMatchesWonInARow = Math.max(rankings[player].mostMatchesWonInARow, matchWinningSprees[player])
        rankings[player].mostMapsWonInARow = Math.max(rankings[player].mostMapsWonInARow, mapWinningSprees[player])
    }

    leaderboards = rankings;
    if(username !== "") {
        await newEntry(username, "Recalculated leaderboards", {});
    }
}

export function getLeaderboardStat(stat: string, map=""): object {
    const obj = {
        order: Object.keys(leaderboards),
        rankings: leaderboards
    };
    switch(stat) {
        case "WR":
            obj.order = obj.order.filter((e) => {
                return obj.rankings[e].matches > 0;
            }).sort((a, b) => {
                return (obj.rankings[b].won/obj.rankings[b].matches) - (obj.rankings[a].won/obj.rankings[a].matches)
            });
            break;
        case 'RRParticipations':
            obj.order.sort((a, b) => {
                return (obj.rankings[b].rrCompetitions.length) - (obj.rankings[a].rrCompetitions.length)
            });
            break;
        case 'RRWCParticipations':
            obj.order.sort((a, b) => {
                return (obj.rankings[b].rrwcCompetitions.length) - (obj.rankings[a].rrwcCompetitions.length)
            });
            break;
        case 'Matches':
            obj.order.sort((a, b) => {
                return (obj.rankings[b].matches) - (obj.rankings[a].matches)
            });
            break;
        case 'MatchesWon':
            obj.order.sort((a, b) => {
                return (obj.rankings[b].won) - (obj.rankings[a].won)
            });
            break;
        case 'Maps':
            obj.order.sort((a, b) => {
                return (obj.rankings[b].mapsPlayedAmount) - (obj.rankings[a].mapsPlayedAmount)
            });
            break;
        case 'MapsWon':
            obj.order.sort((a, b) => {
                return (obj.rankings[b].mapsWonAmount) - (obj.rankings[a].mapsWonAmount)
            });
            break;
        case 'PercentageDecider':
            //TODO: Broken because of the calculation (see L41)
            obj.order = obj.order.filter(function(e) {
                return obj.rankings[e].matchesWithoutGroups > 0;
            }).sort(function(a, b) {
                const scoreA = obj.rankings[a].matchesWithDecider / obj.rankings[a].matchesWithoutGroups;
                const scoreB = obj.rankings[b].matchesWithDecider / obj.rankings[b].matchesWithoutGroups;
                return scoreB - scoreA;
            });
            break;
        case 'FinalAppearances':
            obj.order.sort((a, b) => {
                return (obj.rankings[b].grandFinalAppearances) - (obj.rankings[a].grandFinalAppearances)
            });
            break;
        case 'MostMatchesWonInARow':
            obj.order.sort((a, b) => {
                return (obj.rankings[b].mostMatchesWonInARow) - (obj.rankings[a].mostMatchesWonInARow)
            });
            break;
        case 'MostMapsWonInARow':
            obj.order.sort((a, b) => {
                return (obj.rankings[b].mostMapsWonInARow) - (obj.rankings[a].mostMapsWonInARow)
            });
            break;
        case 'MapPlayed':
            obj.order.sort((a, b) => {
                return (obj.rankings[b].mapsPlayed[mapAbbreviationToArrayIndex(map)]) - (obj.rankings[a].mapsPlayed[mapAbbreviationToArrayIndex(map)])
            });
            break;
        case 'MapWR':
            obj.order = obj.order.filter(function(e) {
                return obj.rankings[e].mapsPlayed[mapAbbreviationToArrayIndex(map)] > 0;
            }).sort((a, b) => {
                return (obj.rankings[b].mapsWon[mapAbbreviationToArrayIndex(map)]/obj.rankings[b].mapsPlayed[mapAbbreviationToArrayIndex(map)]) - (obj.rankings[a].mapsWon[mapAbbreviationToArrayIndex(map)]/obj.rankings[a].mapsPlayed[mapAbbreviationToArrayIndex(map)])
            });
            break;
        case 'DeciderWinrate':
            //TODO: Broken because of the calculation (see L41)
            obj.order = obj.order.filter(function(e) {
                return obj.rankings[e].matchesWithDecider > 0;
            }).sort((a, b) => {
                return (obj.rankings[b].deciderWin/obj.rankings[b].matchesWithDecider) - (obj.rankings[a].deciderWin/obj.rankings[a].matchesWithDecider)
            });
            break;
        case 'OwnMapWinrate':
            obj.order = obj.order.filter(function(e) {
                return obj.rankings[e].ownMaps > 0;
            }).sort((a, b) => {
                return (obj.rankings[b].ownMapsWon/obj.rankings[b].ownMaps) - (obj.rankings[a].ownMapsWon/obj.rankings[a].ownMaps)
            })
            break;
        case 'OpponentMapWinrate':
            obj.order = obj.order.filter(function(e) {
                return obj.rankings[e].opponentMaps > 0;
            }).sort((a, b) => {
                return (obj.rankings[b].opponentMapsWon/obj.rankings[b].opponentMaps) - (obj.rankings[a].opponentMapsWon/obj.rankings[a].opponentMaps)
            })
            break;
        case 'MapWinrate':
            obj.order = obj.order.filter(function(e) {
                return obj.rankings[e].mapsPlayedAmount > 0;
            }).sort((a, b) => {
                return (obj.rankings[b].mapsWonAmount/obj.rankings[b].mapsPlayedAmount) - (obj.rankings[a].mapsWonAmount/obj.rankings[a].mapsPlayedAmount)
            });
            break;
    }
    return obj;
}

function getDefaultRankingObject(): PlayerRanking {
    return {
        rrCompetitions: [] as string[],
        rrwcCompetitions: [] as string[],
        matches: 0,
        won: 0,
        mapsPlayed: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        mapsWon: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        mostMatchesWonInARow: 0,
        mostMapsWonInARow: 0,
        matchesWithDecider: 0,
        grandFinalAppearances: 0,
        matchesWithoutGroups: 0,
        deciderWin: 0,
        ownMapsWon: 0,
        ownMaps: 0,
        opponentMaps: 0,
        opponentMapsWon: 0,
        mapsPlayedAmount: 0,
        mapsWonAmount: 0
    }
}
