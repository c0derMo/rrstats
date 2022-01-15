import { getAllCompetitions, getAllPlayers, getPlayer } from './dataHandling/frontend';
import { getLeaderboardStat } from './dataHandling/leaderboards';
import { getRecords } from './dataHandling/records';
import {VERSION} from "./utils";

let maintenanceMode = false;

export function setMaintenanceMode(mode) {
    maintenanceMode = mode;
}

export function addRoutes(server) {

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
    });

    server.route({
        method: 'GET',
        path: '/changelog',
        handler: (request, h) => {
            if(maintenanceMode) return "This? This is maintenance.";
            request.log(['get', 'info'], '/changelog');
            return h.file("html/changelog.html");
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
        path: '/background.jpg',
        handler: (request, h) => {
            if(maintenanceMode) return "This? This is maintenance.";
            request.log(['get', 'info'], '/background.jpg');
            return h.file("html/background.jpg");
        }
    })

    server.route({
        method: 'GET',
        path: '/frontpageInfo',
        handler: async (request, h) => {
            if(maintenanceMode) return "This? This is maintenance.";
            request.log(['get', 'info'], '/frontpageInfo');
            return {
                players: await getAllPlayers(),
                competitions: await getAllCompetitions(),
                version: VERSION
            }
        }
    })

    server.route({
        method: 'GET',
        path: '/robots.txt',
        handler: (request, h) => {
            request.log(['get', 'info'], '/robots.txt');
            return h.response("User-agent: *\nDisallow: /").type('text/plain');
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
            request.log(['get', 'info'], '/api/' + request.params.player);
            return JSON.stringify(await getPlayer(request.params.player));
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
                return JSON.stringify(getLeaderboardStat(stat));
            } else {
                return JSON.stringify(getLeaderboardStat(stat, map));
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/api/records',
        handler: async (request, h) => {
            if(maintenanceMode) return "This? This is maintenance.";
            request.log(['get', 'info'], '/api/records');
            return JSON.stringify(await getRecords());
        }
    })

}