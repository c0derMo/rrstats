import {RRMatchModel} from "../models/Match";
import {RRPlayerModel} from "../models/Player";

interface DatabaseResult {
    tournament: string;
    type: string;
    message: string;
}

export interface DatabaseChecks {
    score: boolean;
    matchesWithoutPlayers: boolean;
    playersWithoutMatches: boolean;
}

function _formatMessage(id: string, p1: string, p2: string, message: string) {
    return "Match " + id + " (" + p1 + " vs " + p2 + "): " + message;
}

export async function runChecks(checks: DatabaseChecks): Promise<DatabaseResult[]> {
    let result = [] as DatabaseResult[];

    if(checks.score) result = result.concat(await _scoreCheck());
    if(checks.matchesWithoutPlayers) result = result.concat(await _matchWithoutPlayer());
    if(checks.playersWithoutMatches) result = result.concat(await _playersWithoutMatches());

    return result;
}

async function _scoreCheck(): Promise<DatabaseResult[]> {
    const result = [] as DatabaseResult[];
    const matches = await RRMatchModel.find({}).exec();

    for(const match of matches) {
        if((match.score.player1Points > match.score.player2Points && match.score.winner !== 1)
            || (match.score.player2Points > match.score.player1Points && match.score.winner !== 2)
            || (match.score.player1Points == match.score.player2Points && match.score.winner !== 0)) {
            result.push({
                tournament: match.competition,
                type: 'error',
                message: _formatMessage(match.competition, match.player1, match.player2, "Score indicates wrong winner.") });
        }

        let p1MapScore = 0;
        let p2MapScore = 0;
        match.maps.forEach(map => {
            if(map.winner === 1) p1MapScore += 2;
            if(map.winner === 2) p2MapScore += 2;
            if(map.winner === 0) { p1MapScore += 1; p2MapScore += 1 }
        });

        if(match.score.player1Points !== p1MapScore) {
            result.push({
                tournament: match.competition,
                type: 'error',
                message: _formatMessage(match.competition, match.player1, match.player2, "Score doesnt align with player 1 map wins.")
            });
        }
        if(match.score.player2Points !== p2MapScore) {
            result.push({
                tournament: match.competition,
                type: 'error',
                message: _formatMessage(match.competition, match.player1, match.player2, "Score doesnt align with player 2 map wins.")
            });
        }
    }

    return result;
}

async function _matchWithoutPlayer(): Promise<DatabaseResult[]> {
    const result = [] as DatabaseResult[];

    const playersWithObject = await RRPlayerModel.find().distinct('name').exec();
    const matches = await RRMatchModel.find().exec();

    for(const match of matches) {
        if(!playersWithObject.includes(match.player1)) {
            result.push({
                tournament: match.competition,
                type: 'warning',
                message: _formatMessage(match.competition, match.player1, match.player2, "Player 1 has no RRPlayer-object.")
            });
        }
        if(!playersWithObject.includes(match.player2)) {
            result.push({
                tournament: match.competition,
                type: 'warning',
                message: _formatMessage(match.competition, match.player1, match.player2, "Player 2 has no RRPlayer-object.")
            });
        }
    }

    return result;
}

async function _playersWithoutMatches(): Promise<DatabaseResult[]> {
    const result = [] as DatabaseResult[];

    const players = await RRPlayerModel.find().distinct('name').exec();
    const matches = await RRMatchModel.find().exec();

    for(const match of matches) {
        if(players.indexOf(match.player1) >= 0) players.splice(players.indexOf(match.player1), 1);
        if(players.indexOf(match.player2) >= 0) players.splice(players.indexOf(match.player2), 1);
    }

    players.forEach(p => {
        result.push({
            tournament: "",
            type: 'warning',
            message: "Player " + (p as string) + " has no matches assigned." });
    });

    return result;
}
