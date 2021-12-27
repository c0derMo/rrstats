import { setMaintenanceMode } from './routes';
import { runChecks } from './dataHandling/databaseChecks';
import { renderBackendPage } from './backendTemplating';
import { getAllPlayers, getStoredMatches, importSpreadsheet, patchPlayers, addMatch, editMatch, renamePlayer, deleteMatch, verifyLogin, updateUserPassword, getAuditLogs } from './dataHandling/backend';
import { recalculate } from './dataHandling/leaderboards';

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
        handler: async (request, h) => {
            request.log(['info', 'post'], '/backend/login');
            let loginSuccess = await verifyLogin(request.payload.username, request.payload.password);
            if(!loginSuccess) {
                return h.redirect('/backend/login')
            }

            request.cookieAuth.set({ loggedInAs: request.payload.username });

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
        path: '/backend/matches',
        handler: async (request, h) => {
            request.log(['get', 'info'], '/backend/matches');
            return h.file("html/backend/matches.html")
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
            return h.file("html/backend/players.html");
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

    server.route({
        method: 'GET',
        path: '/backend/user',
        handler: (request, h) => {
            request.log(['get', 'info'], '/backend/user');
            return h.file('html/backend/user.html');
        },
        options: {
            auth: 'session'
        }
    })

    server.route({
        method: 'GET',
        path: '/backend/logs',
        handler: (request, h) => {
            request.log(['get', 'info'], '/backend/logs');
            return h.file('html/backend/auditLog.html');
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
        path: '/backend/api/matches',
        handler: async (request, h) => {
            request.log(['get', 'info'], '/backend/api/matches');
            return await getStoredMatches();
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } } 
        }
    });

    server.route({
        method: 'PATCH',
        path: '/backend/api/matches',
        handler: async(request, h) => {
            request.log(['patch', 'info'], '/backend/api/matches');
            return {success: await editMatch(request.payload, request.auth.credentials.loggedInAs)};
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } } 
        }
    });

    server.route({
        method: 'PUT',
        path: '/backend/api/matches',
        handler: async(request, h) => {
            request.log(['put', 'info'], '/backend/api/matches');
            return {success: await addMatch(request.payload, request.auth.credentials.loggedInAs)};
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } } 
        }
    });

    server.route({
        method: 'DELETE',
        path: '/backend/api/matches',
        handler: async(request, h) => {
            request.log(['delete', 'info'], '/backend/api/matches');
            return {success: await deleteMatch(request.payload, request.auth.credentials.loggedInAs)};
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } } 
        }
    })

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
            return {success: await patchPlayers(request.payload, request.auth.credentials.loggedInAs)}
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
        path: '/backend/api/user',
        handler: (request, h) => {
            request.log(['get', 'info'], '/backend/api/user');
            return {
                username: request.auth.credentials.loggedInAs
            }
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } } 
        }
    });

    server.route({
        method: 'POST',
        path: '/backend/api/user',
        handler: async(request, h) => {
            request.log(['post', 'info'], '/backend/api/user');
            return {success: await updateUserPassword(request.auth.credentials.loggedInAs, request.payload.password)};
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } } 
        }
    });
    
    server.route({
        method: 'POST',
        path: '/backend/api/logs',
        handler: async(request, h) => {
            request.log(['post', 'info'], '/backend/api/logs');
            return await getAuditLogs(request.payload.search, request.payload.itemsPerPage, request.payload.page);
        }
    })

}

export { addBackendRoutes };