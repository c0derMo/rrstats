const gDriveToMatchlist = require('./gDriveIntegration');
// @ts-expect-error
const { getNewestCompetitionData, getStoredMatches, getPlayerInfo, getAllPlayers, getRanking, getRecords } = require("./dataManager");
// @ts-expect-error
const { getDiscordProfilePictureURL, getGDriveData } = require("./httpClient");


let maintenanceMode = false;

const _setMaintenanceMode = (mode) => {
    maintenanceMode = mode;
}

const _addRoutes = (server) => {

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            if(maintenanceMode) return "This? This is maintenance.";
            request.log(['get', 'info'], '/');
            return h.file("html/index.html");
        }
    });

    server.route({
        method: 'GET',
        path: '/{player}',
        handler: (request, h) => {
            if(maintenanceMode) return "This? This is maintenance.";
            request.log(['get', 'info'], '/' + request.params.player);
            return h.file("html/playerpage.html");
        }
    });

    server.route({
        method: 'GET',
        path: '/leaderboards',
        handler: (request, h) => {
            if(maintenanceMode) return "This? This is maintenance.";
            request.log(['get', 'info'], '/leaderboards');
            return h.file("html/leaderboards.html");
        }
    });

    server.route({
        method: 'GET',
        path: '/records',
        handler: (request, h) => {
            if(maintenanceMode) return "This? This is maintenance.";
            request.log(['get', 'info'], '/records');
            return h.file("html/records.html");
        }
    })

    server.route({
        method: 'GET',
        path: '/darkly.css',
        handler: (request, h) => {
            if(maintenanceMode) return "This? This is maintenance.";
            request.log(['get', 'info'], '/darkly.css');
            return h.file("html/darkly.css");
        }
    })

    server.route({
        method: 'GET',
        path: '/defaultPB.png',
        handler: (request, h) => {
            if(maintenanceMode) return "This? This is maintenance.";
            request.log(['get', 'info'], '/defaultPB.png');
            return h.file("html/profile.png")
        }
    })

    server.route({
        method: 'GET',
        path: '/utils.js',
        handler: (request, h) => {
            if(maintenanceMode) return "This? This is maintenance.";
            return h.file("html/utils.js");
        }
    })

    server.route({
        method: 'GET',
        path: '/background.jpg',
        handler: (request, h) => {
            if(maintenanceMode) return "This? This is maintenance.";
            request.log(['get', 'info'], '/background.jpg');
            return h.file("html/background.jpg");
        }
    })

    server.route({
        method: 'GET',
        path: '/allPlayers.js',
        handler: (request, h) => {
            if(maintenanceMode) return "This? This is maintenance.";
            request.log(['get', 'info'], '/allPlayers.js');
            return "const players = " + JSON.stringify(getAllPlayers()) + ";";
        }
    })

    server.route({
        method: 'GET',
        path: '/api/{player}',
        handler: async(request, h) => {
            if(maintenanceMode) return "This? This is maintenance.";

            // Query for player info
            const playerInfo = getPlayerInfo(request.params.player);

            // Query for stored matches
            let matches = [];
            
            matches = matches.concat(getStoredMatches(request.params.player));

            if(playerInfo.title === "" && matches.length > 0) {
                playerInfo.title = "Returning Rival"
            } else if(playerInfo.title === "") {
                playerInfo.title = "Roulette Rookie"
            }

            // Query for matches in newest competition
            const newestCompData = getNewestCompetitionData();
            if(newestCompData.name !== "") {
                const newestDoc = await getGDriveData(newestCompData.link);
                const newestData = gDriveToMatchlist(JSON.parse(newestDoc.substring(28, newestDoc.length-2)), newestCompData.name);
    
                matches = matches.concat(newestData.filter(e => {
                    return (e.player1.replace(" [C]", "").replace(" [PC]", "").replace(" [PS]", "").replace(" [XB]", "") == request.params.player || e.player2.replace(" [C]", "").replace(" [PC]", "").replace(" [PS]", "").replace(" [XB]", "") == request.params.player);
                }));
            }

            matches = matches.sort((a, b) => {
                // Sorting by different competition
                if(a.competition !== b.competition) {
                    let tmpA, tmpB;
                    if(a.competition == "RRWC") {
                        tmpA = 3.5;
                    } else {
                        tmpA = parseInt(a.competition.substring(2));
                    }
                    if(b.competition == "RRWC") { 
                        tmpB = 3.5;
                    } else {
                        tmpB = parseInt(b.competition.substring(2));
                    }

                    return tmpB-tmpA;
                }

                let scoreA = 0, scoreB = 0;

                // Assign score
                if(a.round.search("Grand Final") !== -1) {
                    scoreA = 10000;
                } else if(a.round.search("Semi") !== -1) {
                    scoreA = 500;
                } else if(a.round.search("Quarter") !== -1) {
                    scoreA = 100;
                } else if(a.round.search("Group") === -1) {
                    let tmp = a.round.split(" ");
                    scoreA = parseInt(tmp[tmp.length-1]);
                }
                if(a.round.search("LB") !== -1) scoreA *= 10;

                if(b.round.search("Grand Final") !== -1) {
                    scoreB = 10000;
                } else if(b.round.search("Semi") !== -1) {
                    scoreB = 500;
                } else if(b.round.search("Quarter") !== -1) {
                    scoreB = 100;
                } else if(b.round.search("Group") === -1) {
                    let tmp = b.round.split(" ");
                    scoreB = parseInt(tmp[tmp.length-1]);
                }
                if(b.round.search("LB") !== -1) scoreB *= 10;
                
                return scoreB-scoreA;
            });

            const obj = {
                avatar: await getDiscordProfilePictureURL(playerInfo.discordId),
                name: request.params.player,
                title: playerInfo.title,
                competitions: playerInfo.competitions,
                matches: matches
            }

            request.log(['get', 'info'], '/api/' + request.params.player);
            return "setPageContent(" + JSON.stringify(obj) + ");"
        }
    });

    server.route({
        method: 'GET',
        path: '/api/leaderboards',
        handler: (request, h) => {
            if(maintenanceMode) return "This? This is maintenance.";

            const { stat, map } = request.query;

            request.log(['get', 'info'], '/api/leaderboards');
            if(map === undefined || map === "") {
                return getRanking(stat);
            } else {
                return getRanking(stat, map);
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/api/records',
        handler: (request, h) => {
            if(maintenanceMode) return "This? This is maintenance.";
            request.log(['get', 'info'], '/api/records');
            return getRecords();
        }
    })

}

module.exports = {
    addRoutes: _addRoutes,
    setMaintenanceMode: _setMaintenanceMode
};