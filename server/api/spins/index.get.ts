import { Match } from "~/server/model/Match";
import type { IPlayedMap } from "~/utils/interfaces/IMatch";
import type { HitmanMap } from "~/utils/mapUtils";

export default defineEventHandler(async (event) => {
    const matches = await Match.find({});
    const query = getQuery(event);

    let mapFilter = -1;
    if (query.map != null) {
        mapFilter = parseInt(query.map as string) as HitmanMap;
    }

    const spins = matches
        .map((match) => {
            return match.playedMaps
                .filter((map) => map.spin != null)
                .filter((map) => map.map === mapFilter || mapFilter < 0)
                .map((map) => {
                    return {
                        map: map.map,
                        forfeit: map.forfeit,
                        match: {
                            playerOne: match.playerOne,
                            playerTwo: match.playerTwo,
                            competition: match.competition,
                            platform: match.platform,
                            round: match.round,
                            timestamp: match.timestamp,
                        },
                        matchUuid: match.uuid,
                        timeTaken: map.timeTaken,
                        winner: map.winner,
                        spin: map.spin,
                    } as IPlayedMap;
                });
        })
        .reduce((prev, cur) => [...prev, ...cur], []);

    return spins;
});
