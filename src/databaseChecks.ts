// @ts-expect-error
const { getAllCompetitions, getStoredCompetition } = require("./dataManager");

//
// each db check is a function that returns an object
// object is built up like this:
// {
//      warnings: []
//      errors: []
// }
//

const _runChecks = (checks) => {
    let result = {
        warnings: [],
        errors: []
    };
    if(checks.includes("score")) {
        let tmp = _scoreCheck();
        result.warnings = result.warnings.concat(tmp.warnings);
        result.errors = result.errors.concat(tmp.errors);
    }
    return result;
}

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
            if(p1Score > p2Score && match.winner === 2) {
                result.errors.push("Competition " + element + " Match " + idx + " (" + match.player1 + " vs " + match.player2 + "): Score indicates wrong winner: Score: " + match.score + " Winner: " + match.winner);
            } else if(p2Score > p1Score && match.winner === 1) {
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
                result.errors.push("Competition " + element + " Match " + idx + " (" + match.player1 + " vs " + match.player2 + "): Player 1 Score doesnt align with map wins: Score: " + match.score + " P1MapWins: " + p1MapScore);
            }
            if(p2Score !== p2MapScore) {
                result.errors.push("Competition " + element + " Match " + idx + " (" + match.player1 + " vs " + match.player2 + "): Player 2 Score doesnt align with map wins: Score: " + match.score + " P2MapWins: " + p2MapScore);
            }
        });
    });

    return result;
}

module.exports = {
    runChecks: _runChecks
}