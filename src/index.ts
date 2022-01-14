'use strict'

import { recalculate } from "./dataHandling/leaderboards";
import Hapi from "@hapi/hapi";
import Inert from "@hapi/inert";
import Cookie from "@hapi/cookie";
import { addRoutes } from "./routes";
import { addBackendRoutes } from "./backendRoutes";
import { addAPIRoutes } from "./3rdPartyRoutes";
import { connect } from "./databaseManager";
import * as crypt from "crypto";
import { config } from 'dotenv';
config();

async function init() {

    const server = Hapi.server({
        port: process.env.PORT || 8000,
        host: process.env.HOST || 'localhost'
    });

    await server.register(Inert);
    await server.register(Cookie);

    server.auth.strategy('session', 'cookie', {
        cookie: {
            name: 'sid-rrstats',
            password: crypt.randomBytes(256).toString('hex'),
            isSecure: false,
            ttl: 14400000
        },
        redirectTo: "/backend/login",
        validateFunc: async(request, session) => {
            return { valid: session.loggedInAs !== "" }
        }
    });

    server.events.on({ name: 'request', channels: 'app' }, (request, event, tags) => {
        
        let logMessage = new Date().toString();
        
        if(tags.info) {
            logMessage = "\x1b[34m" + logMessage + "      "
        } else if(tags.warning) {
            logMessage = "\x1b[33m" + logMessage + " WARN "
        } else if(tags.error) {
            logMessage = "\x1b[31m" + logMessage + " ERR  "
        }

        if(tags.get) {
            logMessage += "GET    "
        } else if(tags.post) {
            logMessage += "POST   "
        } else if(tags.patch) {
            logMessage += "PATCH  "
        } else if(tags.delete) {
            logMessage += "DELETE "
        } else if(tags.put) {
            logMessage += "PUT    "
        }

        logMessage += event.data;
        logMessage += "\x1b[0m"

        console.log(logMessage);
    });

    addRoutes(server);
    addBackendRoutes(server);
    addAPIRoutes(server);

    await connect();

    await server.start();
    console.log("F7SC Player Statistics running @ " + server.info.uri);

    await recalculate([], "System (reboot)");
}

process.on("unhandledRejection", err => {
    console.log(err);
    process.exit(1);
});

init();