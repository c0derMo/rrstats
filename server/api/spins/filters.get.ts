import HitmapsSpinIntegration from "~/server/controller/integrations/HitmapsSpinIntegration";
import { type HitmanMap, getMap } from "~/utils/mapUtils";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    if (query.map == null) {
        throw createError({ statusCode: 400, message: "map must be supplied" });
    }

    const map = parseInt(query.map as string) as HitmanMap;
    const mapInfo = getMap(map);
    if (mapInfo == null) {
        throw createError({ statusCode: 400, message: "invalid map number" });
    }

    const disguises = await HitmapsSpinIntegration.getDisguises(mapInfo);
    const killMethods = await HitmapsSpinIntegration.getKillMethods(mapInfo);

    return {
        disguises,
        killMethods,
    };
});
