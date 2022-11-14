import { setMaintenanceMode } from './routes';
import {DatabaseChecks, runChecks} from './dataHandling/databaseChecks';
import {
    getAllPlayers,
    getStoredMatches,
    importSpreadsheet,
    patchPlayers,
    addMatch,
    editMatch,
    renamePlayer,
    deleteMatch,
    verifyLogin,
    updateUserPassword,
    getAuditLogs,
    deleteCompetition,
    addCompetition,
    lookupPlayer,
    editCompetition,
    getStoredCompetitions,
    importStandings, SpreadsheetImportOptions, StandingsImportOptions,
} from './dataHandling/backend';
import {
    getStoredRecords, editRecord, addRecord, deleteRecord} from './dataHandling/records';
import {tweet} from "./dataHandling/externalConnector";
import {disconnect} from "./databaseManager";
import {recalculate} from "./dataHandling/leaderboards";
import {Server} from "@hapi/hapi";
import { RRMatch } from './models/Match';
import { RRCompetiton } from './models/Competitions';
import { RRRecord } from './models/Record';

interface Payload {
    username?: string;
    password?: string;
    search?: string;
    itemsPerPage?: number;
    page?: number;
    oldName?: string;
    newName?: string;
}

interface BackendResult {
    success: boolean;
    error?: string;
    amountOfMatches?: number;
    changes?: string[];
}

export function addBackendRoutes(server: Server) {

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
            const loginSuccess = await verifyLogin((request.payload as Payload).username, (request.payload as Payload).password);
            if(!loginSuccess) {
                return h.redirect('/backend/login')
            }

            request.cookieAuth.set({ loggedInAs: (request.payload as Payload).username });

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
        handler: (request, h) => {
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
        handler: (request, h) => {
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
        handler: (request, h) => {
            request.log(['get', 'info'], '/backend/importSpreadsheet');
            return h.file("html/backend/importSpreadsheet.html");
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
            return h.file("html/backend/importStandings.html");
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
            return h.file("html/backend/databaseChecks.html");
        },
        options: {
            auth: 'session'
        }
    })

    server.route({
        method: 'GET',
        path: '/backend/renamePlayer',
        handler: (request, h) => {
            request.log(['get', 'info'], '/backend/renamePlayer');
            return h.file("html/backend/renamePlayer.html");
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

    server.route({
        method: 'GET',
        path: '/backend/competitions',
        handler: (request, h) => {
            request.log(['get', 'info'], '/backend/competitions');
            return h.file('html/backend/comps.html');
        },
        options: {
            auth: 'session'
        }
    })

    server.route({
        method: 'GET',
        path: '/backend/tweet',
        handler: (request, h) => {
            request.log(['get', 'info'], '/backend/tweet');
            return h.file("html/backend/tweet.html");
        },
        options: {
            auth: 'session'
        }
    })

    server.route({
        method: 'GET',
        path: '/backend/records',
        handler: (request, h) => {
            request.log(['get', 'info'], '/backend/records');
            return h.file("html/backend/records.html");
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
            if(request.query.mode === "true") {
                setMaintenanceMode(true);
                return h.response({"maintenance": true});
            } else {
                setMaintenanceMode(false);
                return h.response({"maintenance": false});
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
            return h.response(await getStoredMatches());
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
            let result: BackendResult;
            try {
                result = {success: await editMatch(request.payload as RRMatch, request.auth.credentials.loggedInAs as string)};
            } catch(e: unknown) {
                result = {success: false, error: e.toString()}
            }
            return h.response(result);
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
            let result: BackendResult;
            try {
                result = {success: await addMatch(request.payload as RRMatch, request.auth.credentials.loggedInAs as string)};
            } catch(e: unknown) {
                result = {success: false, error: e.toString()}
            }
            return h.response(result);
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
            let result: BackendResult;
            try {
                result = { success: await deleteMatch(request.payload as RRMatch, request.auth.credentials.loggedInAs as string) };
            } catch(e: unknown) {
                result = { success: false, error: e.toString() }
            }
            return h.response(result);
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
            return h.response(await getAllPlayers());
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
            let result: BackendResult;
            try {
                result = {success: await patchPlayers(request.payload as {[key: string]: string}, request.auth.credentials.loggedInAs as string)};
            } catch(e: unknown) {
                result = {success: false, error: e.toString()}
            }
            return h.response(result);
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
            void server.stop();
            disconnect();
            return h.response("");
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
            request.log(['post', 'info'], '/backend/api/importSpreadsheet');
            let result: BackendResult;
            try {
                result = {success: true, amountOfMatches: await importSpreadsheet(request.payload as SpreadsheetImportOptions, request.auth.credentials.loggedInAs as string)};
            } catch(e: unknown) {
                result = {success: false, error: e.toString()}
            }
            return h.response(result);
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } }
        }
    });

    server.route({
        method: 'POST',
        path: '/backend/api/importStandings',
        handler: async(request, h) => {
            request.log(['post', 'info'], '/backend/api/importStandings');
            let result: BackendResult;
            try {
                result = {success: true, ...await importStandings(request.payload as StandingsImportOptions, request.auth.credentials.loggedInAs as string)}
            } catch(e: unknown) {
                result = {success: false, error: e.toString()}
            }
            return h.response(result);
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } }
        }
    })

    server.route({
        method: 'POST',
        path: '/backend/api/databaseChecks',
        handler: async(request, h) => {
            request.log(['post', 'info'], '/backend/api/databaseChecks');
            return h.response(await runChecks(request.payload as DatabaseChecks));
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } }
        }
    });

    server.route({
        method: 'POST',
        path: '/backend/api/renamePlayer',
        handler: async(request, h) => {
            const { oldName, newName } = request.payload as Payload;
            request.log(['post', 'info'], '/backend/api/renamePlayer');
            let result: BackendResult;
            try {
                result = {success: true, changes: await renamePlayer(oldName, newName, request.auth.credentials.loggedInAs as string)};
            } catch(e: unknown) {
                result = {success: false, error: e.toString()}
            }
            return h.response(result);
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
            return h.response({
                username: request.auth.credentials.loggedInAs
            });
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
            return h.response({success: await updateUserPassword(request.auth.credentials.loggedInAs as string, (request.payload as Payload).password)});
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
            return h.response(await getAuditLogs((request.payload as Payload).search, (request.payload as Payload).itemsPerPage, (request.payload as Payload).page));
        }
    })

    server.route({
        method: 'GET',
        path: '/backend/api/competitions',
        handler: async (request, h) => {
            request.log(['get', 'info'], '/backend/api/competitions');
            return h.response(await getStoredCompetitions());
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } }
        }
    });

    server.route({
        method: 'PATCH',
        path: '/backend/api/competitions',
        handler: async(request, h) => {
            request.log(['patch', 'info'], '/backend/api/competitions');
            let result: BackendResult;
            try {
                result = {success: await editCompetition(request.payload as RRCompetiton, request.auth.credentials.loggedInAs as string)};
            } catch(e: unknown) {
                result = {success: false, error: e.toString()}
            }
            return h.response(result);
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } }
        }
    });

    server.route({
        method: 'PUT',
        path: '/backend/api/competitions',
        handler: async(request, h) => {
            request.log(['put', 'info'], '/backend/api/competitions');
            let result: BackendResult;
            try {
                result = {success: await addCompetition(request.payload as RRCompetiton, request.auth.credentials.loggedInAs as string)};
            } catch(e: unknown) {
                result = {success: false, error: e.toString()}
            }
            return h.response(result);
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } }
        }
    });

    server.route({
        method: 'DELETE',
        path: '/backend/api/competitions',
        handler: async(request, h) => {
            request.log(['delete', 'info'], '/backend/api/competitions');
            let result: BackendResult;
            try {
                result = {success: await deleteCompetition(request.payload as RRCompetiton, request.auth.credentials.loggedInAs as string)};
            } catch(e: unknown) {
                result = {success: false, error: e.toString()}
            }
            return h.response(result);
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } }
        }
    })

    server.route({
        method: 'GET',
        path: '/backend/api/playerLookup',
        handler: async(request, h) => {
            request.log(['get', 'info'], '/backend/api/playerLookup');
            if(request.query.id !== undefined) {
                return h.response(await lookupPlayer(request.query.id as string, "id"));
            } else if(request.query.name !== undefined) {
                return h.response(await lookupPlayer(request.query.name as string, "name"));
            } else {
                return h.response({name: "", uuid: ""});
            }
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } }
        }
    });

    server.route({
        method: 'POST',
        path: '/backend/api/tweet',
        handler: async(request, h) => {
            request.log(['post', 'info'], '/backend/api/tweet');
            return h.response(await tweet(request.payload as string[], request.auth.credentials.loggedInAs as string));
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } }
        }
    })

    server.route({
        method: 'GET',
        path: '/backend/api/records',
        handler: async (request, h) => {
            request.log(['get', 'info'], '/backend/api/records');
            return h.response(await getStoredRecords());
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } }
        }
    });

    server.route({
        method: 'PATCH',
        path: '/backend/api/records',
        handler: async(request, h) => {
            request.log(['patch', 'info'], '/backend/api/records');
            let result: BackendResult;
            try {
                result = {success: await editRecord(request.payload as RRRecord, request.auth.credentials.loggedInAs as string)};
            } catch(e: unknown) {
                result = {success: false, error: e.toString()}
            }
            return h.response(result);
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } }
        }
    });

    server.route({
        method: 'PUT',
        path: '/backend/api/records',
        handler: async(request, h) => {
            request.log(['put', 'info'], '/backend/api/records');
            let result: BackendResult;
            try {
                result = {success: await addRecord(request.payload as RRRecord, request.auth.credentials.loggedInAs as string)};
            } catch(e: unknown) {
                result = {success: false, error: e.toString()}
            }
            return h.response(result);
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } }
        }
    });

    server.route({
        method: 'DELETE',
        path: '/backend/api/records',
        handler: async(request, h) => {
            request.log(['delete', 'info'], '/backend/api/records');
            let result: BackendResult;
            try {
                result = {success: await deleteRecord(request.payload as RRRecord, request.auth.credentials.loggedInAs as string)}
            } catch(e: unknown) {
                result = {success: false, error: e.toString() }
            }
            return h.response(result);
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } }
        }
    })

    server.route({
        method: 'GET',
        path: '/backend/api/recalculateLeaderboards',
        handler: async(request, h) => {
            request.log(['get', 'info'], '/backend/api/recalculateLeaderboards');
            await recalculate([], request.auth.credentials.loggedInAs as string);
            return h.response({success: true})
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } }
        }
    })

}
