import { getStoredMatches, getRecords, validateAPIKey, getAllPlayersDetailed, getNewestCompetitionData } from "./dataManager";
import { getGDriveData } from "./httpClient";
import gDriveToMatchlist from './gDriveIntegration';

const addAPIRoutes = (server) => {

    server.route({
        method: 'GET',
        path: '/external-api/player/{player}',
        handler: async (request, h) => {
            if(!validateAPIKey(request.headers["authorization"])) {
                return h.response().code(403);
            }

            const players = getAllPlayersDetailed();
            let name = "";
            for(let player in players) {
                if(players[player].discordId === request.params.player) {
                    name = player;
                }
            }

            let matches = getStoredMatches(name);
            const newestCompData = getNewestCompetitionData();
            if(newestCompData.name !== "") {
                const newestDoc = await getGDriveData(newestCompData.link, newestCompData.name);
                const newestData = gDriveToMatchlist(JSON.parse(newestDoc.substring(47, newestDoc.length-2)), newestCompData.name);
    
                matches = matches.concat(newestData.filter(e => {
                    return (e.player1.replace(" [C]", "").replace(" [PC]", "").replace(" [PS]", "").replace(" [XB]", "") == name || e.player2.replace(" [C]", "").replace(" [PC]", "").replace(" [PS]", "").replace(" [XB]", "") == name);
                }));
            }

            return matches;
        }
    });

    server.route({
        method: 'GET',
        path: '/external-api/map/{map}',
        handler: (request, h) => {
            if(!validateAPIKey(request.headers["authorization"])) {
                return h.response().code(403);
            }

            const records = getRecords();
            let record = records.maps.find((e) => {
                return e.map === request.params.map;
            })

            return record;

        }
    })

}

export { addAPIRoutes }