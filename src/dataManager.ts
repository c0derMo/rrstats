const fs = require('fs/promises');
const { setJSONPath, mapAbreviationToArrayIndex } = require("./utils");

let configs = {}

const _loadConfigs = async () => {
    const generalConfig = await fs.readFile(__dirname + "/data/config.json", "utf8");
    const generalConfigJSON = JSON.parse(generalConfig);
    configs["general"] = generalConfigJSON;

    await configs["general"].competitions.forEach(async(element) => {
        const competition = await fs.readFile(__dirname + "/data/" + element + ".json", "utf8");
        const competitionJSON = JSON.parse(competition);
        configs[element] = competitionJSON;
    });

    const playerDatabase = await fs.readFile(__dirname + "/data/playerDatabase.json", "utf8");
    const playerDatabaseJSON = JSON.parse(playerDatabase);
    configs["playerDB"] = playerDatabaseJSON;

    try {
        const rankings = await fs.readFile(__dirname + "/data/leaderboards.json", "utf8");
        const rankingsJSON = JSON.parse(rankings);
        configs["rankings"] = rankingsJSON
    } catch(e) {
        await _recalculateRankings();
    }
}

const _getStoredMatches = (playername) => {
    let matches = []

    configs["general"].competitions.forEach(element => {
        matches = matches.concat(configs[element].filter(e => {
            return (e.player1.replace(" [C]", "").replace(" [PC]", "").replace(" [PS]", "").replace(" [XB]", "") == playername || e.player2.replace(" [C]", "").replace(" [PC]", "").replace(" [PS]", "").replace(" [XB]", "") == playername);
        }));
    });

    return matches;
}

const _getNewestCompetitionData = () => {
    return {
        name: configs["general"].currentCompetition.name,
        link: 'https://spreadsheets.google.com/feeds/cells/' + configs["general"].currentCompetition.sheetID + '/' + configs["general"].currentCompetition.tabID + '/public/values?alt=json-in-script'
    }
}

const _getPlayerAbreviationOverride = (abreviation) => {
    if(configs["general"].playerAbreviationsOverrides[abreviation] !== undefined) {
        return configs["general"].playerAbreviationsOverrides[abreviation]
    }
    return ""
}

const _getPlayerInfo = (player) => {
    if(configs["playerDB"][player] !== undefined) {
        return configs["playerDB"][player]
    }
    return {
        discordId: "",
        title: "",
        competitions: []
    }
}

const _getAllPlayers = () => {
    let a = [];
    Object.keys(configs["playerDB"]).forEach(e => {
        a.push({title: e});
    });
    return a;
}

const _getStoredCompetition = (comp) => {
    if(configs["general"].competitions.includes(comp)) {
        return configs[comp];
    }
    return [];
}

const _patchStoredComptition = async (comp, changes) => {
    if(configs["general"].competitions.includes(comp)) {
        Object.keys(changes).forEach(c => {
            setJSONPath(configs[comp], c, changes[c]);
        })

        await fs.writeFile(__dirname + "/data/" + comp + ".json", JSON.stringify(configs[comp]), 'utf8');
        return true
    }
    return false
}

const _getAllPlayersDetailed = () => {
    return configs["playerDB"];
}

const _patchUsers = async (changes) => {
    Object.keys(changes).forEach(c => {
        setJSONPath(configs["playerDB"], c, changes[c]);
    });

    await fs.writeFile(__dirname + "/data/playerDatabase.json", JSON.stringify(configs["playerDB"]), 'utf8');
    return true;
}

const _addCompetition = async (compName, compData) => {
    configs["general"].competitions.push(compName);
    configs[compName] = compData;
    await fs.writeFile(__dirname + "/data/" + compName + ".json", JSON.stringify(compData), 'utf8');
    await fs.writeFile(__dirname + "/data/config.json", JSON.stringify(configs["general"]), 'utf8')
}

const _getAllCompetitions = () => {
    return configs["general"].competitions
}

const _getRanking = (stat, map="") => {
    const obj = {
        order: Object.keys(configs["rankings"]),
        rankings: configs["rankings"]
    }
    switch(stat) {
        case 'WR':
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
            obj.order.sort((a, b) => {
                return (obj.rankings[b].matchesWithDecider/obj.rankings[b].matches) - (obj.rankings[a].matchesWithDecider/obj.rankings[a].matches)
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
            obj.order.sort((a, b) => {
                if(obj.rankings[b].mapsPlayed[mapAbreviationToArrayIndex(map)] === 0) {
                    return -1;
                } else if(obj.rankings[a].mapsPlayed[mapAbreviationToArrayIndex(map)] === 0) {
                    return 1;
                }
                return (obj.rankings[b].mapsWon[mapAbreviationToArrayIndex(map)]/obj.rankings[b].mapsPlayed[mapAbreviationToArrayIndex(map)]) - (obj.rankings[a].mapsWon[mapAbreviationToArrayIndex(map)]/obj.rankings[a].mapsPlayed[mapAbreviationToArrayIndex(map)])
            });
            break;   
    }
    return obj;
}

const _recalculateRankings = async () => {
    // RR Competitions played                                   D
    // RRWC Competitions played                                 D
    // Matches played                                           D
    // Winrate                                                  D
    // Maps played on a per map basis (am I crazy?)             D
    // Winrate on a per map basis (am I really crazy??)         D
    // Longest Winning-Spree                                    D
    // Percentage of maps that went to a decider                D
    
    const competitions = _getAllCompetitions();
    let rankings = {}
    let currentWinningSprees = {}

    competitions.forEach(element => {
        const comp = _getStoredCompetition(element);
        comp.reverse().forEach(match => {
            let player1 = match.player1.replace(" [C]", "").replace(" [PC]", "").replace(" [PS]", "").replace(" [XB]", "");
            let player2 = match.player2.replace(" [C]", "").replace(" [PC]", "").replace(" [PS]", "").replace(" [XB]", "");

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
                    grandFinalAppearances: 0
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
                    grandFinalAppearances: 0
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
            if(match.maps.length > 2 && match.round !== "Grand Final") {
                rankings[player1].matchesWithDecider += 1
                rankings[player2].matchesWithDecider += 1
            }

            
            // Winrate & winningspree stuff
            if (match.winner == 1) {
                rankings[player1].won += 1
                currentWinningSprees[player1] += 1

                if(currentWinningSprees[player2] > rankings[player2].longestWinningSpree) {
                    rankings[player2].longestWinningSpree = currentWinningSprees[player2]
                }
                currentWinningSprees[player2] = 0
            } else {
                rankings[player2].won += 1
                currentWinningSprees[player2] += 1

                if(currentWinningSprees[player1] > rankings[player1].longestWinningSpree) {
                    rankings[player1].longestWinningSpree = currentWinningSprees[player1]
                }
                currentWinningSprees[player1] = 0
            }


            // Per Map Stuff
            match.maps.forEach(map => {
                rankings[player1].mapsPlayed[mapAbreviationToArrayIndex(map.map)] += 1
                rankings[player2].mapsPlayed[mapAbreviationToArrayIndex(map.map)] += 1

                if(map.winner === 1) {
                    rankings[player1].mapsWon[mapAbreviationToArrayIndex(map.map)] += 1
                } else if(map.winner === 2) {
                    rankings[player2].mapsWon[mapAbreviationToArrayIndex(map.map)] += 1
                }
            });
        });
    });

    Object.keys(currentWinningSprees).forEach(e => {
        if(currentWinningSprees[e] > rankings[e].longestWinningSpree) {
            rankings[e].longestWinningSpree = currentWinningSprees[e];
        }
    });

    configs["rankings"] = rankings;
    await fs.writeFile(__dirname + "/data/leaderboards.json", JSON.stringify(rankings), 'utf8');
}

module.exports = {
    getNewestCompetitionData: _getNewestCompetitionData,
    getStoredMatches: _getStoredMatches,
    loadConfigs: _loadConfigs,
    getPlayerAbreviationOverride: _getPlayerAbreviationOverride,
    getPlayerInfo: _getPlayerInfo,
    getAllPlayers: _getAllPlayers,
    getStoredCompetition: _getStoredCompetition,
    patchStoredComptition: _patchStoredComptition,
    getAllPlayersDetailed: _getAllPlayersDetailed,
    patchUsers: _patchUsers,
    addCompetition: _addCompetition,
    getAllCompetitions: _getAllCompetitions,
    getRanking: _getRanking,
    recalculateRankings: _recalculateRankings
}