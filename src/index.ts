'use strict'

const Hapi = require("@hapi/hapi");
const Inert = require("@hapi/inert");
const addRoutes = require("./routes");
const { loadConfigs } = require("./dataManager");

const init = async() => {

    const server = Hapi.server({
        port: 8000,
        host: 'localhost'
    });

    await server.register(Inert);
    addRoutes(server);

    await loadConfigs();

    await server.start();
    console.log("F7SC Player Statistics running @ " + server.info.uri);
}

process.on("unhandledRejection", err => {
    console.log(err);
    process.exit(1);
});

init();