const fs = require('fs/promises');
import { setJSONPath, mapAbreviationToArrayIndex } from "./utils";
import { connect, disconnect } from './databaseManager';
import { RRMatchModel } from './models/Match';
import { RRPlayerModel } from './models/Player';
import { RRCompetitionModel } from './models/Competitions';

let configs = {}

const loadConfigs = async () => {
    const generalConfig = await fs.readFile(__dirname + "/data/config.json", "utf8");
    const generalConfigJSON = JSON.parse(generalConfig);
    configs["general"] = generalConfigJSON;

    await connect();
}

const getStoredMatches = async(playername) => {
    return await RRMatchModel.findOne({ primaryName: playername }).exec();
}

//TODO: ?
const getNewestCompetitionData = () => {
    return {
        name: configs["general"].currentCompetition.name,
        link: "https://docs.google.com/spreadsheets/d/" + configs["general"].currentCompetition.sheetID + "/gviz/tq?tqx=out:json&sheet=" + configs["general"].currentCompetition.tabName
    }
}

const getPlayerAbreviationOverride = (abreviation) => {
    
}

const getPlayerInfo = async(player) => {
    let playerInfo = await RRPlayerModel.findOne({ primaryName: player }).exec();

    if (playerInfo == undefined) {
        return {
            discordId: "",
            title: "",
            competitions: [],
            customTitle: false
        }
    } else {
        return {
            discordId: playerInfo.discordId,
            title: playerInfo.title,
            competitions: playerInfo.competitions,
            customTitle: playerInfo.customTitle
        };
    }
}

const getAllPlayers = async () => {
    let players = await RRPlayerModel.find({ name: { $nin: configs["general"].excludedFromSearch }}).exec();
    return players.map(el => { return {title: el.primaryName} });
}

const getStoredCompetitionMatches = async (comp) => {
    return await RRMatchModel.find({ competition: comp }).exec();
}

const patchStoredComptition = async (comp, changes) => {

}

const getAllPlayersDetailed = async () => {
    return RRPlayerModel.find({ }).exec();
}

const patchUsers = async (changes) => {

}

const addCompetition = async (compName, compData) => {

}

const getAllCompetitions = () => {

}

const getRanking = (stat, map="") => {
    const obj = {
        order: Object.keys(configs["rankings"]),
        rankings: configs["rankings"]
    }
    switch(stat) {
        case 'WR':
            obj.order = obj.order.filter(function(e) {
                return obj.rankings[e].matches > 0;
            })
            obj.order.sort((a, b) => {
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
        case 'PercentageDecider':
            obj.order = obj.order.filter(function(e) {
                return obj.rankings[e].matchesWithoutGroups > 0;
            })
            obj.order.sort(function(a, b) {
                let scoreA = obj.rankings[a].matchesWithDecider / obj.rankings[a].matchesWithoutGroups;
                let scoreB = obj.rankings[b].matchesWithDecider / obj.rankings[b].matchesWithoutGroups;
                return scoreB - scoreA;
            });
            break;
        case 'FinalAppearances':
            obj.order.sort((a, b) => {
                return (obj.rankings[b].grandFinalAppearances) - (obj.rankings[a].grandFinalAppearances)
            });
            break;
        case 'LongestWinSpree':
            obj.order.sort((a, b) => {
                return (obj.rankings[b].longestWinningSpree) - (obj.rankings[a].longestWinningSpree)
            });
            break;
        case 'MapPlayed':
            obj.order.sort((a, b) => {
                return (obj.rankings[b].mapsPlayed[mapAbreviationToArrayIndex(map)]) - (obj.rankings[a].mapsPlayed[mapAbreviationToArrayIndex(map)])
            });
            break;
        case 'MapWR':
            obj.order = obj.order.filter(function(e) {
                return obj.rankings[e].mapsPlayed[mapAbreviationToArrayIndex(map)] > 0;
            })
            obj.order.sort((a, b) => {
                return (obj.rankings[b].mapsWon[mapAbreviationToArrayIndex(map)]/obj.rankings[b].mapsPlayed[mapAbreviationToArrayIndex(map)]) - (obj.rankings[a].mapsWon[mapAbreviationToArrayIndex(map)]/obj.rankings[a].mapsPlayed[mapAbreviationToArrayIndex(map)])
            });
            break;
        case 'DeciderWinrate':
            obj.order = obj.order.filter(function(e) {
                return obj.rankings[e].matchesWithDecider > 0;
            })
            obj.order.sort((a, b) => {
                return (obj.rankings[b].deciderWin/obj.rankings[b].matchesWithDecider) - (obj.rankings[a].deciderWin/obj.rankings[a].matchesWithDecider)
            });
            break;
        case 'OwnMapWinrate':
            obj.order = obj.order.filter(function(e) {
                return obj.rankings[e].ownMaps > 0;
            })
            obj.order.sort((a, b) => {
                return (obj.rankings[b].ownMapsWon/obj.rankings[b].ownMaps) - (obj.rankings[a].ownMapsWon/obj.rankings[a].ownMaps)
            })
            break;
        case 'OpponentMapWinrate':
            obj.order = obj.order.filter(function(e) {
                return obj.rankings[e].opponentMaps > 0;
            })
            obj.order.sort((a, b) => {
                return (obj.rankings[b].opponentMapsWon/obj.rankings[b].opponentMaps) - (obj.rankings[a].opponentMapsWon/obj.rankings[a].opponentMaps)
            })
            break;
        case 'MapWinrate':
            obj.order = obj.order.filter(function(e) {
                return obj.rankings[e].mapsPlayedAmount > 0;
            })
            obj.order.sort((a, b) => {
                return (obj.rankings[b].mapsWonAmount/obj.rankings[b].mapsPlayedAmount) - (obj.rankings[a].mapsWonAmount/obj.rankings[a].mapsPlayedAmount)
            });
            break;
    }
    return obj;
}

const recalculateRankings = async (newestCompName = "", newestCompData = []) => {
    // RR Competitions played                                   D
    // RRWC Competitions played                                 D
    // Matches played                                           D
    // Winrate                                                  D
    // Maps played on a per map basis (am I crazy?)             D
    // Winrate on a per map basis (am I really crazy??)         D
    // Longest Winning-Spree                                    D
    // Percentage of maps that went to a decider                D
    // Decider Winrate                                          D
    // Percentage of own-map-wins                               D
    // Percentage of opponent-map-wins                          D
    // Mapwin%
    
    const competitions = JSON.parse(JSON.stringify(getAllCompetitions()));
    let rankings = {}
    let currentWinningSprees = {}

    if(newestCompName !== "") {
        competitions.push(newestCompName);
    }

    for(let element of competitions) {
        let comp;
        if(element === newestCompName) {
            comp = newestCompData
        } else {
            comp = await getStoredCompetitionMatches(element);
        }
        comp.sort((a, b) => {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        }).reverse().forEach(match => {
            let player1 = match.player1;
            let player2 = match.player2;
            // Create player objects if not yet done
            if(rankings[player1] === undefined) {
                rankings[player1] = {
                    rrCompetitions: [],
                    rrwcCompetitions: [],
                    matches: 0,
                    won: 0,
                    mapsPlayed: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    mapsWon: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    longestWinningSpree: 0,
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

                currentWinningSprees[player1] = 0;
            }

            if(rankings[player2] === undefined) {
                rankings[player2] = {
                    rrCompetitions: [],
                    rrwcCompetitions: [],
                    matches: 0,
                    won: 0,
                    mapsPlayed: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    mapsWon: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    longestWinningSpree: 0,
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

                currentWinningSprees[player2] = 0;
            }

            // RR & RRWC Competitions
            if(!rankings[player1].rrCompetitions.includes(element)) rankings[player1].rrCompetitions.push(element);
            if(!rankings[player2].rrCompetitions.includes(element)) rankings[player2].rrCompetitions.push(element);

            if(element.toLowerCase().search("wc") != -1) {
                if(!rankings[player1].rrwcCompetitions.includes(element)) rankings[player1].rrwcCompetitions.push(element);
                if(!rankings[player2].rrwcCompetitions.includes(element)) rankings[player2].rrwcCompetitions.push(element);
            }


            // Grand final appearances
            if(match.round == "Grand Final") {
                rankings[player1].grandFinalAppearances += 1
                rankings[player2].grandFinalAppearances += 1
            }


            // Matches played & Percentage that gone to decider
            rankings[player1].matches += 1
            rankings[player2].matches += 1
            if(match.round.search("Group") == -1) {
                rankings[player1].matchesWithoutGroups += 1
                rankings[player2].matchesWithoutGroups += 1
                if(match.maps.length > 2 && match.round !== "Grand Final") {
                    rankings[player1].matchesWithDecider += 1
                    rankings[player2].matchesWithDecider += 1
                    // Decider winrate
                    if(match.winner == 1) {
                        rankings[player1].deciderWin += 1;
                    } else if(match.winner == 2) {
                        rankings[player2].deciderWin += 1;
                    }
                }
            }

            
            // Winrate & winningspree stuff
            if (match.winner == 1) {
                rankings[player1].won += 1
                currentWinningSprees[player1] += 1

                if(currentWinningSprees[player2] > rankings[player2].longestWinningSpree) {
                    rankings[player2].longestWinningSpree = currentWinningSprees[player2]
                }
                currentWinningSprees[player2] = 0
            } else if(match.winner == 2) {
                rankings[player2].won += 1
                currentWinningSprees[player2] += 1

                if(currentWinningSprees[player1] > rankings[player1].longestWinningSpree) {
                    rankings[player1].longestWinningSpree = currentWinningSprees[player1]
                }
                currentWinningSprees[player1] = 0
            }


            // Per Map Stuff
            match.maps.forEach(map => {
                rankings[player1].mapsPlayedAmount += 1
                rankings[player2].mapsPlayedAmount += 1
                rankings[player1].mapsPlayed[mapAbreviationToArrayIndex(map.map)] += 1
                rankings[player2].mapsPlayed[mapAbreviationToArrayIndex(map.map)] += 1

                if(map.winner === 1) {
                    rankings[player1].mapsWon[mapAbreviationToArrayIndex(map.map)] += 1
                    rankings[player1].mapsWonAmount += 1
                } else if(map.winner === 2) {
                    rankings[player2].mapsWon[mapAbreviationToArrayIndex(map.map)] += 1
                    rankings[player2].mapsWonAmount += 1
                }

                if(map.picked === 1) {
                    rankings[player1].ownMaps += 1
                    rankings[player2].opponentMaps += 1
                    if(map.winner === 1) {
                        rankings[player1].ownMapsWon += 1;
                    } else if(map.winner === 2) {
                        rankings[player2].opponentMapsWon += 1;
                    }
                } else if(map.picked === 2) {
                    rankings[player2].ownMaps += 1
                    rankings[player1].opponentMaps += 1
                    if(map.winner === 2) {
                        rankings[player2].ownMapsWon += 1;
                    } else if(map.winner === 1) {
                        rankings[player1].opponentMapsWon += 1;
                    }
                }
            });
        });
    }

    Object.keys(currentWinningSprees).forEach(e => {
        if(currentWinningSprees[e] > rankings[e].longestWinningSpree) {
            rankings[e].longestWinningSpree = currentWinningSprees[e];
        }
    });

    configs["rankings"] = rankings;
    await fs.writeFile(__dirname + "/data/leaderboards.json", JSON.stringify(rankings), 'utf8');
}

const getRecords = () => {
    
}

const patchRecords = async (changes) => {
    
}

const renamePlayer = async (oldName, newName) => {
    
}

const validateAPIKey = (apiKey) => {
    return configs["general"].apiKeys.includes(apiKey);
}

export { getNewestCompetitionData }
export { getStoredMatches }
export { loadConfigs }
export { getPlayerAbreviationOverride }
export { getPlayerInfo }
export { getAllPlayers }
export { getStoredCompetitionMatches as getStoredCompetition }
export { patchStoredComptition }
export { getAllPlayersDetailed }
export { patchUsers }
export { addCompetition }
export { getAllCompetitions }
export { getRanking }
export { recalculateRankings }
export { getRecords }
export { patchRecords }
export { renamePlayer }
export { validateAPIKey }