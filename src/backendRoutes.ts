import { setMaintenanceMode } from './routes';
import { runChecks } from './dataHandling/databaseChecks';
import { renderBackendPage } from './backendTemplating';
import { getAllPlayers, getStoredCompetitionMatches, importSpreadsheet, patchPlayers, patchStoredCompetitionMatches, renamePlayer } from './dataHandling/backend';
import { recalculate } from './dataHandling/leaderboards';

const accessToken = process.env.BACKEND_TOKEN || "DevToken123";

const addBackendRoutes = (server) => {

    server.route({
        method: 'GET',
        path: '/backend/components.js',
        handler: (request, h) => {
            return h.file("html/backend/components.js");
        }
    })

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
        handler: async (request, h) => {
            request.log(['get', 'info'], '/backend/competitions');
            return await renderBackendPage("matchList", "RR Matches");
        },
        options: {
            auth: 'session'
        }
    })

    server.route({
        method: 'GET',
        path: '/backend/players',
        handler: async (request, h) => {
            request.log(['get', 'info'], '/backend/players');
            return await renderBackendPage("playerList", "RR Players");
        },
        options: {
            auth: 'session'
        }
    })

    server.route({
        method: 'GET',
        path: '/backend/importSpreadsheet',
        handler: async (request, h) => {
            request.log(['get', 'info'], '/backend/importSpreadsheet');
            return await renderBackendPage("competitionImport", "Import table");
        },
        options: {
            auth: 'session'
        }
    })

    server.route({
        method: 'GET',
        path: '/backend/importStandings',
        handler: async (request, h) => {
            request.log(['get', 'info'], '/backend/importStandings');
            return await renderBackendPage("standingsImport", "Import standings");
        },
        options: {
            auth: 'session'
        }
    })

    server.route({
        method: 'GET',
        path: '/backend/databaseChecks',
        handler: async (request, h) => {
            request.log(['get', 'info'], '/backend/databaseChecks');
            return await renderBackendPage("databaseChecks", "Database Checks");
        },
        options: {
            auth: 'session'
        }
    })

    server.route({
        method: 'GET',
        path: '/backend/renamePlayer',
        handler: async (request, h) => {
            request.log(['get', 'info'], '/backend/renamePlayer');
            return await renderBackendPage("renamePlayer", "Rename Player");
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
            console.log(request.query.mode);
            if(request.query.mode == "true") {
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
        handler: async (request, h) => {
            request.log(['get', 'info'], '/backend/api/competition');
            return await getStoredCompetitionMatches(request.query.competition);
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
            request.log(['patch', 'info'], '/backend/api/competition');
            return {success: await patchStoredCompetitionMatches(request.payload)};
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } } 
        }
    });

    server.route({
        method: 'GET',
        path: '/backend/api/players',
        handler: async(request, h) => {
            request.log(['get', 'info'], '/backend/api/players');
            return await getAllPlayers();
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
            request.log(['patch', 'info'], '/backend/api/players');
            return {success: await patchPlayers(request.payload)}
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
            const { sID, tabName, comp, cA, yearInput } = request.payload;
            request.log(['post', 'info'], '/backend/api/importSpreadsheet');
            return await importSpreadsheet(sID, tabName, comp, cA, parseInt(yearInput));
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
            await recalculate();
            request.log(['get', 'info'], '/backend/api/recalculateLeaderboards');
            return {success: true}
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
    });
    
    server.route({
        method: 'POST',
        path: '/backend/api/renamePlayer',
        handler: (request, h) => {
            const { oldName, newName } = request.payload;
            request.log(['post', 'info'], '/backend/api/renamePlayer');
            return renamePlayer(oldName, newName);
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } } 
        }
    })

    server.route({
        method: 'GET',
        path: '/backend/api/menu',
        handler: (request, h) => {
            request.log(['post', 'info'], '/backend/api/menu');
            return JSON.stringify([
                {
                    "title": "Maintenance mode",
                    "icon": "eye lash",
                    "type": "checkbox",
                    "id": "maintenance-mode",
                    "description": "Activates maintenance mode for the entire site. The frontend + API will become unavailable."
                },
                {
                    "title": "Competitions",
                    "icon": "edit",
                    "type": "link",
                    "href": "/backend/competitions",
                    "description": "Lists all the matches of a competition."
                },
                {
                    "title": "Players",
                    "icon": "edit",
                    "type": "link",
                    "href": "/backend/players",
                    "description": "Lists all the players."
                },
                {
                    "title": "Import spreadsheet",
                    "icon": "file import",
                    "type": "link",
                    "href": "/backend/importSpreadsheet",
                    "description": "Imports a spreadsheet as a permanent part of the system."
                },
                {
                    "title": "Bulk import standings",
                    "icon": "file import",
                    "type": "link",
                    "href": "/backend/importStandings",
                    "description": "Import standings and adds them to the corresponding players."
                },
                {
                    "title": "Database checks",
                    "icon": "stethoscope",
                    "type": "link",
                    "href": "/backend/databaseChecks",
                    "description": "Runs various checks on the database."
                },
                {
                    "title": "Rename player",
                    "icon": "edit",
                    "type": "link",
                    "href": "/backend/renamePlayer",
                    "description": "Renames a player across all databases."
                },
                {
                    "title": "Reload configs",
                    "icon": "upload",
                    "type": "button",
                    "id": "reload",
                    "description": "Reloads all the config files from disk."
                },
                {
                    "title": "Recalculate leaderboards",
                    "icon": "calculator",
                    "type": "button",
                    "id": "recalcLeaderboard",
                    "description": "Recalculate all leaderboard data. (Does not include data from active competition - load a player page instead)"
                },
                {
                    "title": "Shutdown server",
                    "icon": "power off",
                    "type": "button",
                    "id": "shutdown",
                    "description": "Shuts down the entire server."
                }
            ])
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } } 
        }
    })

}

export { addBackendRoutes };