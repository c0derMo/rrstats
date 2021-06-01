const { setMaintenanceMode } = require("./routes");
const { getStoredCompetition, patchStoredComptition } = require("./dataManager");

const accessToken = process.env.BACKEND_TOKEN || "DevToken123";

const _addBackendRoutes = (server) => {

    server.route({
        method: 'GET',
        path: '/backend',
        handler: (request, h) => {
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
            return h.file("html/backend/login.html")
        }
    });

    server.route({
        method: 'POST',
        path: '/backend/login',
        handler: (request, h) => {
            if(request.payload.token !== accessToken) {
                return h.redirect('/backend/login')
            }

            request.cookieAuth.set({ loggedIn: true })

            return h.redirect('/backend')
        }
    })


    // Pages below
    
    server.route({
        method: 'GET',
        path: '/backend/competitions',
        handler: (request, h) => {
            return h.file("html/backend/matchList.html");
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
            console.log(request.payload);
            changes = JSON.parse(changes);
            console.log(comp);
            console.log(changes);
            if(await patchStoredComptition(comp, changes)) {
                return {status: "ok"}
            } else {
                return {status: "error"}
            }
        },
        options: {
            auth: 'session',
            plugins: { 'hapi-auth-cookie': { redirectTo: false } } 
        }
    });

}

module.exports = _addBackendRoutes;