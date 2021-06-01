'use strict'

const Hapi = require("@hapi/hapi");
const Inert = require("@hapi/inert");
const { addRoutes } = require("./routes");
const { loadConfigs } = require("./dataManager");
const addBackendRoutes = require("./backendRoutes");
const crypt = require("crypto");

const init = async() => {

    const server = Hapi.server({
        port: 8000,
        host: 'localhost'
    });

    await server.register(Inert);
    await server.register(require('@hapi/cookie'));

    server.auth.strategy('session', 'cookie', {
        cookie: {
            name: 'sid-rrstats',
            password: crypt.randomBytes(256).toString('hex'),
            isSecure: false,
            ttl: 3600000
        },
        redirectTo: "/backend/login",
        validateFunc: async(request, session) => {
            return { valid: session.loggedIn }
        }
    });

    addRoutes(server);
    addBackendRoutes(server);

    await loadConfigs();

    await server.start();
    console.log("F7SC Player Statistics running @ " + server.info.uri);
}

process.on("unhandledRejection", err => {
    console.log(err);
    process.exit(1);
});

init();