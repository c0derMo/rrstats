interface Match {
    platform: string,
    round: string,
    competition: string,
    player1: string,
    player2: string,
    winner: number,
    score: string,
    maps: RRMap[],
    timestamp: Date
}

interface RRMap {
    map: string,
    winner: number
}