import { ChoosingPlayer, IMatch, RRBannedMap, RRMap, WinningPlayer } from "../interfaces/IMatch";
import { HitmanMap } from "../mapUtils";

function wasPickedByPlayer(match: IMatch, map: RRMap | RRBannedMap, player: string) {
    return map.picked === ChoosingPlayer.PLAYER_ONE && match.playerOne === player || map.picked === ChoosingPlayer.PLAYER_TWO && match.playerTwo === player;
}

function wasWonByPlayer(match: IMatch, map: RRMap, player: string) {
    return map.winner === WinningPlayer.PLAYER_ONE && match.playerOne === player || map.winner === WinningPlayer.PLAYER_TWO && match.playerTwo === player;
}

export function mapWinrate(matches: IMatch[], player: string): number {
    let maps = 0;
    let wins = 0;
    let ties = 0;

    for (const match of matches) {
        const playedMaps = match.playedMaps.filter(m => m.forfeit !== true);
        maps += playedMaps.length;
        wins += playedMaps.filter(m => {
            return match.playerOne === player && m.winner === WinningPlayer.PLAYER_ONE ||
                match.playerTwo === player && m.winner === WinningPlayer.PLAYER_TWO
        }).length;
        ties += playedMaps.filter(m => {
            return m.winner === WinningPlayer.DRAW
        }).length;
    }

    return (wins + 0.5 * ties) / maps;
}

export function mapsPicked(matches: IMatch[], player: string): HitmanMap[] {
    const maps: HitmanMap[] = [];

    for (const match of matches) {
        for (const map of match.playedMaps) {
            if (map.forfeit === true) continue;
            if (wasPickedByPlayer(match, map, player)) {
                maps.push(map.map);
            }
        }
    }

    return maps;
}

export function mapsPlayed(matches: IMatch[]): HitmanMap[] {
    const maps: HitmanMap[] = [];

    for (const match of matches) {
        for (const map of match.playedMaps) {
            if (map.forfeit === true) continue;
            maps.push(map.map);
        }
    }

    return maps;
}

export function mapsPickedPerMap(matches: IMatch[], player: string): Record<HitmanMap, number> {
    const maps: Record<number, number> = {};

    for (const match of matches) {
        for (const map of match.playedMaps) {
            if (map.forfeit === true) continue;

            if (wasPickedByPlayer(match, map, player)) {
                if (maps[map.map] == undefined) {
                    maps[map.map] = 0;
                }
    
                maps[map.map] += 1;
            }

        }
    }

    return maps;
}

export function mapsBannedPerMap(matches: IMatch[], player: string): Record<HitmanMap, number> {
    const maps: Record<number, number> = {};

    for (const match of matches) {
        for (const map of match.bannedMaps) {
            if (wasPickedByPlayer(match, map, player)) {
                if (maps[map.map] == undefined) {
                    maps[map.map] = 0;
                }

                maps[map.map] += 1;
            }
        }
    }

    return maps;
}

export function mapWinratePerMap(matches: IMatch[], player: string): Record<HitmanMap, {winrate:number,wins:number,plays:number}> {
    const maps: Record<number, {winrate:number,wins:number,plays:number}> = {};

    for (const match of matches) {
        for (const map of match.playedMaps) {
            if (map.forfeit === true) continue;

            if (maps[map.map] == undefined) {
                maps[map.map] = {winrate:0,wins:0,plays:0};
            }
            
            maps[map.map].plays += 1;

            if (wasWonByPlayer(match, map, player)) {
                maps[map.map].wins += 1;
            } else if (map.winner === WinningPlayer.DRAW) {
                maps[map.map].wins += 0.5;
            }

        }
    }

    for (const map in maps) {
        maps[map].winrate = maps[map].wins / maps[map].plays;
    }

    return maps;
}

export function mapPicksForMap(matches: IMatch[], player: string, map: HitmanMap): number {
    let amount = 0;

    for (const match of matches) {
        for (const playedMap of match.playedMaps) {
            if (playedMap.forfeit === true) continue;
            if (playedMap.map !== map) continue;
            if (wasPickedByPlayer(match, playedMap, player)) {
                amount++;
            }
        }
    }

    return amount;
}

export function mapBansForMap(matches: IMatch[], player: string, map: HitmanMap): number {
    let amount = 0;

    for (const match of matches) {
        for (const bannedMaps of match.bannedMaps) {
            if (bannedMaps.map !== map) continue;
            if (wasPickedByPlayer(match, bannedMaps, player)) {
                amount++;
            }
        }
    }

    return amount;
}

export function mapPlaysForMap(matches: IMatch[], map: HitmanMap): number {
    let amount = 0;

    for (const match of matches) {
        for (const playedMap of match.playedMaps) {
            if (playedMap.forfeit === true) continue;
            if (playedMap.map !== map) continue;
            amount++;
        }
    }

    return amount;
}

export function mapWinsForMap(matches: IMatch[], player: string, map: HitmanMap): number {
    let amount = 0;

    for (const match of matches) {
        for (const playedMap of match.playedMaps) {
            if (playedMap.forfeit === true) continue;
            if (playedMap.map !== map) continue;
            if (wasWonByPlayer(match, playedMap, player)) {
                amount++;
            }
            if (playedMap.winner === WinningPlayer.DRAW) {
                amount += 0.5;
            }
        }
    }

    return amount;
}