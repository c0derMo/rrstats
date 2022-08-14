import { getGDriveData } from "./httpClient";
import { RRPlayerModel } from "./models/Player";
import {IRRMatch, RRMatchModel} from "./models/Match";
import {RRCompetitionModel} from "./models/Competitions";
import {IRRRecord} from "./models/Record";
import {getRecords} from "./dataHandling/records";
import {UserModel} from "./models/User";
import {Server} from "@hapi/hapi";

interface ExtendedRRMatch extends IRRMatch {
    _id?: string;
    __v?: string;
    player1Discord?: string;
    player2Discord?: string;
}

interface ExtendedRRRecord extends IRRRecord {
    player: string;
}

function addAPIRoutes(server: Server) {

    server.route({
        method: 'GET',
        path: '/external-api/player/{player}',
        handler: async (request, h) => {
            const user = await validateAPIKey(request.headers.authorization);
            if(!user) {
                return h.response().code(403);
            }
            const discordId = request.params.player as string;
            request.log(['get', 'info'], `/external-api/player/${discordId} [User: ${user}]`);

            const requestedPlayer = await RRPlayerModel.findOne({ discordId: discordId }).exec();
            if (!requestedPlayer) {
                return h.response().code(404);
            }

            let matches = JSON.parse(JSON.stringify(await RRMatchModel.find({ $or: [ {player1: requestedPlayer.name}, {player2: requestedPlayer.name} ] }, { _id: 0, __v: 0}).exec())) as ExtendedRRMatch[];
            const newestCompData = await RRCompetitionModel.find({ updateWithSheet: true }).sort("-sortingIndex").exec();
            for(const e of newestCompData) {
                const newestData = await getGDriveData(`https://docs.google.com/spreadsheets/d/e/${e.sheetId}/pub?gid=${e.gid}&single=true&output=csv`, e.tag, e.parserOptions);
                matches = matches.concat(newestData.filter(e => {
                    return e.player1 === requestedPlayer.name || e.player2 === requestedPlayer.name;
                }) as ExtendedRRMatch[]);
            }

            // Aggregating all names to lookup discord id's for
            const playerNames: string[] = [ requestedPlayer.name ];
            for(const match of matches) {
                if(!playerNames.includes(match.player1)) {
                    playerNames.push(match.player1);
                }
                if(!playerNames.includes(match.player2)) {
                    playerNames.push(match.player2);
                }
            }

            // Looking up all discord id's
            const players = await RRPlayerModel.find({ name: { $in: playerNames } }).exec();
            for(const match of matches) {
                const player1 = players.find((e) => { return e.name === match.player1 });
                if(player1) {
                    match.player1Discord = player1.discordId;
                }
                const player2 = players.find((e) => { return e.name === match.player2 });
                if(player2) {
                    match.player2Discord = player2.discordId;
                }
            }

            return h.response(matches).type("application/json");
        }
    });

    server.route({
        method: 'GET',
        path: '/external-api/map/{map}',
        handler: async (request, h) => {
            const user = await validateAPIKey(request.headers.authorization);
            if(!user) {
                return h.response().code(403);
            }
            request.log(['get', 'info'], `/external-api/map/${request.params.map as string} [User: ${user}]`);

            const records = await getRecords(request.params.map as string);
            if(records.length === 0) {
                return h.response().code(404);
            }

            const response = JSON.parse(JSON.stringify(records[0])) as ExtendedRRRecord;
            delete response.players;
            const players = [] as string[];
            for(const record of records) {
                players.push(...record.players);
            }
            response.player = players.join(", ");

            return h.response(response).type("application/json");
        }
    })

    server.route({
        method: 'GET',
        path: '/external-api/accolate/{player}',
        handler: async (request, h) => {
            const user = await validateAPIKey(request.headers.authorization);
            if(!user) {
                return h.response().code(403);
            }
            const requestedPlayer = request.params.player as string;
            request.log(['get', 'info'], `/external-api/accolate/${requestedPlayer} [User: ${user}]`);

            const player = await RRPlayerModel.findOne({ discordId: requestedPlayer }).exec();
            if (player.title && (!player.customTitle || request.query.includeCustomTitles )) {
                return h.response(player.title);
            }
            const matches = await RRMatchModel.count({ $or: [ {player1: requestedPlayer}, {player2: requestedPlayer} ] }).exec();
            if (matches > 0) {
                return h.response("Returning Rival");
            } else {
                return h.response("Roulette Rookie");
            }
        }
    })
}

async function validateAPIKey(apiKey: string): Promise<string> {
    const user = await UserModel.findOne({ passwordHash: apiKey, type: 'APIKEY' }).exec();
    if(!user) return undefined;
    return user.name;
}

export { addAPIRoutes }
