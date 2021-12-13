import { getGDriveData } from "./httpClient";
import gDriveToMatchlist from './gDriveIntegration';

const addAPIRoutes = (server) => {

    server.route({
        method: 'GET',
        path: '/external-api/player/{player}',
        handler: async (request, h) => {
            
        }
    });

    server.route({
        method: 'GET',
        path: '/external-api/map/{map}',
        handler: (request, h) => {
            
        }
    })

}

export { addAPIRoutes }