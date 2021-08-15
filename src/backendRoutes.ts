import { setMaintenanceMode } from './routes';
import { getStoredCompetition, patchStoredComptition, getAllPlayersDetailed, patchUsers, loadConfigs, addCompetition, recalculateRankings } from "./dataManager";
const axios = require("axios");
import gDriveObjectToMatchlist from './gDriveIntegration';
import { runChecks } from './databaseChecks';

const accessToken = process.env.BACKEND_TOKEN || "DevToken123";

const addBackendRoutes = (server) => {

    server.route({
        method: 'GET',
        path: '/backend',
        handler: (request, h) => {
            request.log(['get', 'info'], '/backend');
            return h.file("html/backend/index.html")
        },
        options: {
            auth: 'session'
        }
    });

    server.route({
        method: 'GET',
        path: '/backend/login',
        handler: (request, h) => {
            request.log(['get', 'info'], '/backend/login');
            return h.file("html/backend/login.html")
        }
    });

    server.route({
        method: 'POST',
        path: '/backend/login',
        handler: (request, h) => {
            request.log(['info', 'post'], '/login');
            if(request.payload.token !== accessToken) {
                return h.redirect('/backend/login')
            }

            request.cookieAuth.set({ loggedIn: true })

            return h.redirect('/backend')
        }
    });
    
    server.route({
        method: 'GET',
        path: '/backend/logout',
        handler: (request, h) => {
            request.cookieAuth.clear();
            request.log(['get', 'info'], '/backend/logout');
            return h.redirect("/");
        }
    })


    // Pages below
    
    server.route({
        method: 'GET',
        path: '/backend/competitions',
        handler: (request, h) => {
            request.log(['get', 'info'], '/backend/competitions');
            return h.file("html/backend/matchList.html");
        },
        options: {
            auth: 'session'
        }
    })

    server.route({
        method: 'GET',
        path: '/backend/players',
        handler: (request, h) => {
            request.log(['get', 'info'], '/backend/players');
            return h.file("html/backend/playerList.html");
        },
        options: {
            auth: 'session'
        }
    })

    server.route({
        method: 'GET',
        path: '/backend/importSpreadsheet',
        handler: (request, h) => {
            request.log(['get', 'info'], '/backend/importSpreadsheet');
            return h.file("html/backend/competitionImport.html");
        },
        options: {
            auth: 'session'
        }
    })

    server.route({
        method: 'GET',
        path: '/backend/importStandings',
        handler: (request, h) => {
            request.log(['get', 'info'], '/backend/importStandings');
            return h.file('html/backend/standingsImport.html');
        },
        options: {
            auth: 'session'
        }
    })

    server.route({
        method: 'GET',
        path: '/backend/databaseChecks',
        handler: (request, h) => {
            request.log(['get', 'info'], '/backend/databaseChecks');
            return h.file('html/backend/databaseChecks.html');
        },
        options: {
            auth: 'session'
        }
    })


    // API Calls below

    server.route({
        method: 'GET',
        path: '/backend/api/maintenance',
        handler: (request, h) => {
            request.log(['get', 'info'], '/backend/api/maintenance');
            if(request.query.mode === "on") {
                setMaintenanceMode(true);
                return {"maintenance": true}
            } else {
                setMaintenanceMode(false);
                return {"maintenance": false}
            }
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } } 
        }
    });

    server.route({
        method: 'GET',
        path: '/backend/api/competition',
        handler: (request, h) => {
            request.log(['get', 'info'], '/backend/api/competition');
            return getStoredCompetition(request.query.competition);
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } } 
        }
    });

    server.route({
        method: 'PATCH',
        path: '/backend/api/competition',
        handler: async(request, h) => {
            let { comp, changes } = request.payload;
            changes = JSON.parse(changes);
            if(await patchStoredComptition(comp, changes)) {
                request.log(['patch', 'info'], '/backend/api/competition');
                return {status: "ok"}
            } else {
                request.log(['patch', 'error'], '/backend/api/competition');
                return {status: "error"}
            }
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } } 
        }
    });

    server.route({
        method: 'GET',
        path: '/backend/api/players',
        handler: (request, h) => {
            request.log(['get', 'info'], '/backend/api/players');
            return getAllPlayersDetailed();
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } } 
        }
    });

    server.route({
        method: 'PATCH',
        path: '/backend/api/players',
        handler: async (request, h) => {
            let { changes } = request.payload;
            changes = JSON.parse(changes);
            if(await patchUsers(changes)) {
                request.log(['patch', 'info'], '/backend/api/players');
                return {status: 'ok'}
            } else {
                request.log(['patch', 'error'], '/backend/api/players');
                return {status: 'error'}
            }
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } } 
        }
    });

    server.route({
        method: 'GET',
        path: '/backend/api/reloadConfigs',
        handler: async (request, h) => {
            await loadConfigs();
            request.log(['get', 'info'], '/backend/api/reloadConfigs');
            return {status: 'ok'}
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } } 
        }
    });

    server.route({
        method: 'GET',
        path: '/backend/api/shutdown',
        handler: (request, h) => {
            request.log(['get', 'info'], '/backend/api/shutdown');
            server.stop();
            return "";
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } } 
        }
    });

    server.route({
        method: 'POST',
        path: '/backend/api/importSpreadsheet',
        handler: async (request, h) => {
            const { sID, tabID, comp, cA } = request.payload;
            let req = await axios.get("https://spreadsheets.google.com/feeds/cells/" + sID + "/" + tabID + "/public/values?alt=json-in-script");
            let fancyData;
            if(cA === "") {
                fancyData = gDriveObjectToMatchlist(JSON.parse(req.data.substring(28, req.data.length-2)), comp, true);
            } else {
                fancyData = gDriveObjectToMatchlist(JSON.parse(req.data.substring(28, req.data.length-2)), comp, true, JSON.parse(cA));
            }
            await addCompetition(comp, fancyData);
            request.log(['post', 'info'], '/backend/api/importSpreadsheet');
            return fancyData;
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } } 
        }
    });

    server.route({
        method: 'GET',
        path: '/backend/api/recalculateLeaderboards',
        handler: async (request, h) => {
            await recalculateRankings();
            request.log(['get', 'info'], '/backend/api/recalculateLeaderboards');
            return {status: 'ok'}
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } } 
        }
    });

    server.route({
        method: 'POST',
        path: '/backend/api/runDatabaseChecks',
        handler: (request, h) => {
            const { checks } = request.payload;
            request.log(['post', 'info'], '/backend/api/runDatabaseChecks');
            return runChecks(JSON.parse(checks));
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } } 
        }
    })

}

export { addBackendRoutes };