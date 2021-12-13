//
// each db check is a function that returns an object
// object is built up like this:
// {
//      warnings: []
//      errors: []
// }
//


const _formatMessage = (competition, match, p1, p2, message) => {
    return "Competition " + competition + " Match " + match + " (" + p1 + " vs " + p2 + "): " + message;
}

const _normalizePlayerName = (pname) => {
    return pname.replace(" [C]", "").replace(" [PC]", "").replace(" [PS]", "").replace(" [XB]", "");
}

//TODO: Fix all this
const runChecks = (checks) => {
    /*let result = {
        warnings: [],
        errors: []
    };
    if(checks.includes("score")) {
        let tmp = _scoreCheck();
        result.warnings = result.warnings.concat(tmp.warnings);
        result.errors = result.errors.concat(tmp.errors);
    }
    if(checks.includes("playersWithoutMatches")) {
        let tmp = _playerWithoutMatches();
        result.warnings = result.warnings.concat(tmp.warnings);
        result.errors = result.errors.concat(tmp.errors);
    }
    if(checks.includes("matchesWithoutPlayers")) {
        //let tmp = _matchWithoutPlayer();      TODO: See _matchWithoutPlayer();
        //result.warnings = result.warnings.concat(tmp.warnings);
        //result.errors = result.errors.concat(tmp.errors);
    }
    return result;*/
}
/*
const _scoreCheck = () => {
    let result = {
        warnings: [],
        errors: []
    }

    getAllCompetitions().forEach(element => {
        getStoredCompetition(element).forEach((match, idx) => {
            let splitScore = match.score.split("-");
            let p1Score = parseInt(splitScore[0]);
            let p2Score = parseInt(splitScore[1]);
            
            // Check for correct winner
            if(p1Score > p2Score && match.winner !== 1) {
                result.errors.push("Competition " + element + " Match " + idx + " (" + match.player1 + " vs " + match.player2 + "): Score indicates wrong winner: Score: " + match.score + " Winner: " + match.winner);
            } else if (p2Score > p1Score && match.winner !== 2) {
                result.errors.push("Compettion " + element + " Match " + idx + " (" + match.player1 + " vs " + match.player2 + "): Score indicates wrong winner: Score: " + match.score + " Winner: " + match.winner);
            } else if (p2Score == p1Score && match.winner !== 0) {
                result.errors.push("Compettion " + element + " Match " + idx + " (" + match.player1 + " vs " + match.player2 + "): Score indicates wrong winner: Score: " + match.score + " Winner: " + match.winner);
            }

            let p1MapScore = 0;
            let p2MapScore = 0;
            match.maps.forEach(map => {
                if(map.winner === 1) p1MapScore += 2;
                if(map.winner === 2) p2MapScore += 2;
                if(map.winner === 0) {p1MapScore += 1; p2MapScore += 1};
            });

            if(p1Score !== p1MapScore) {
                result.errors.push(_formatMessage(element, idx, match.player1, match.player2, "Player 1 Score doesnt align with map wins: Score: " + match.score + " P1MapWins: " + p1MapScore));
            }
            if(p2Score !== p2MapScore) {
                result.errors.push(_formatMessage(element, idx, match.player1, match.player2, "Player 2 Score doesnt align with map wins: Score: " + match.score + " P2MapWins: " + p2MapScore));
            }
        });
    });

    return result;
}


const _matchWithoutPlayer = () => {
    let result = {
        warnings: [],
        errors: []
    }

    getAllCompetitions().forEach(element => {
        getStoredCompetition(element).forEach((match, idx) => {
            if(getPlayerInfo(_normalizePlayerName(match.player1)).notSet === true) {
                result.warnings.push(_formatMessage(element, idx, match.player1, match.player2, "Player " + match.player1 + " has no external player entry."));
            };
            if(getPlayerInfo(_normalizePlayerName(match.player2)).notSet === true) {
                result.warnings.push(_formatMessage(element, idx, match.player1, match.player2, "Player " + match.player2 + " has no external player entry."));
            }
        });
    });

    return result;
}


const _playerWithoutMatches = () => {
    let result = {
        warnings: [],
        errors: []
    }

    let playersToCheck = [];
    let allPlayers = getAllPlayersDetailed()
    Object.keys(allPlayers).forEach((p) => {
        let hasGMT = false;
        allPlayers[p].competitions.forEach(element => {
            if(element.competition.includes("Ghost Mode")) hasGMT = true;
        });
        if(!hasGMT) playersToCheck.push(p);
    });

    getAllCompetitions().forEach(element => {
        getStoredCompetition(element).forEach(match => {
            if(playersToCheck.includes(_normalizePlayerName(match.player1))) {
                playersToCheck = playersToCheck.filter((e) => {return e !== _normalizePlayerName(match.player1)});
            }
            if(playersToCheck.includes(_normalizePlayerName(match.player2))) {
                playersToCheck = playersToCheck.filter((e) => {return e !== _normalizePlayerName(match.player2)});
            }
        });
    });

    if(playersToCheck.length > 0) {
        playersToCheck.forEach((e) => {
            result.errors.push("Player " + e + " has no matches assigned and isn't a GMT player");
        })
    }

    return result;
}*/

export { runChecks };