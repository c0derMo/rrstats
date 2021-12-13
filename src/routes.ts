import gDriveToMatchlist from './gDriveIntegration';
import { getNewestCompetitionData, getStoredMatches, getPlayerInfo, getAllPlayers, getRanking, getRecords } from "./dataManager";
import { getDiscordProfilePictureURL, getGDriveData } from "./httpClient";
import { RRPlayerModel } from './models/Player';

let maintenanceMode = false;

const setMaintenanceMode = (mode) => {
    maintenanceMode = mode;
}

const addRoutes = (server) => {

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
        handler: async (request, h) => {
            if(maintenanceMode) return "This? This is maintenance.";
            request.log(['get', 'info'], '/allPlayers.js');
            return "const players = " + JSON.stringify(await getAllPlayers()) + ";";
        }
    })

    server.route({
        method: 'GET',
        path: '/robots.txt',
        handler: (request, h) => {
            request.log(['get', 'info'], '/robots.txt');
            return h.response("User-agent: *\nDisallow: /").type('text/plain');;
        }
    });

    server.route({
        method: 'GET',
        path: '/favicon.ico',
        handler: (request, h) => {
            request.log(['get', 'info'], '/favicon.ico');
            return h.file("html/icon.ico");
        }
    });

    server.route({
        method: 'GET',
        path: '/api/{player}',
        handler: async(request, h) => {
            if(maintenanceMode) return "This? This is maintenance.";

            // Query for player info
            const playerInfo = await getPlayerInfo(request.params.player);
            let title = playerInfo.title;

            // Query for stored matches
            let matches = [];
            
            matches = matches.concat(await getStoredMatches(request.params.player));

            if(title === "" && matches.length > 0) {
                title = "Returning Rival"
            } else if(title === "") {
                title = "Roulette Rookie"
            }

            // Query for matches in newest competition
            const newestCompData = getNewestCompetitionData();
            if(newestCompData.name !== "") {
                const newestDoc = await getGDriveData(newestCompData.link, newestCompData.name);
                const newestData = await gDriveToMatchlist(JSON.parse(newestDoc.substring(47, newestDoc.length-2)), newestCompData.name);

                matches = matches.concat(newestData.filter(e => {
                    return (e.player1 == request.params.player || e.player2 == request.params.player);
                }));
            }

            matches = matches.sort((a, b) => {
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            })

            const obj = {
                avatar: await getDiscordProfilePictureURL(playerInfo.discordId),
                name: request.params.player,
                title: title,
                competitions: playerInfo.competitions,
                matches: matches,
                customTitle: playerInfo.customTitle
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

export { addRoutes };
export { setMaintenanceMode };