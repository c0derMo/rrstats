const mapAbreviationToFullName = (abv) => {
    switch(abv) {
        // Season 1
        case "PAR":
            return "Paris"
        case "SAP":
            return "Sapienza"
        case "MAR":
            return "Marrakesh"
        case "BKK":
            return "Bangkok"
        case "COL":
            return "Colorado"
        case "HOK":
            return "Hokkaido"
        
        // Season 2
        case "MIA":
            return "Miami"
        case "SF":
            return "Santa Fortuna"
        case "MUM":
            return "Mumbai"
        case "WC":
            return "Whittleton Creek"
        case "SGA":
            return "Isle of Sgàil"
        case "NY":
            return "New York"
        case "HAV":
            return "Haven Island"

        // Season 3
        case "DUB":
            return "Dubai"
        case "DAR":
            return "Dartmoor"
        case "BER":
            return "Berlin"
        case "CHO":
            return "Chongqing"
        case "MEN":
            return "Mendoza"
        
        default:
            return "Unknown"
    }
}

const mapAbreviationToArrayIndex = (abv) => {
    switch(abv) {
        // Season 1
        case "PAR":
            return 0
        case "SAP":
            return 1
        case "MAR":
            return 2
        case "BKK":
            return 3
        case "COL":
            return 4
        case "HOK":
            return 5
        
        // Season 2
        case "MIA":
            return 6
        case "SF":
            return 7
        case "MUM":
            return 8
        case "WC":
            return 9
        case "SGA":
            return 10
        case "NY":
            return 11
        case "HAV":
            return 12

        // Season 3
        case "DUB":
            return 13
        case "DAR":
            return 14
        case "BER":
            return 15
        case "CHO":
            return 16
        case "MEN":
            return 17
        
        default:
            return "Unknown"
    }
}

const getDefaultMapPickObj = () => {
    return [
        {map: "PAR", picked: 0},
        {map: "SAP", picked: 0},
        {map: "MAR", picked: 0},
        {map: "BKK", picked: 0},
        {map: "COL", picked: 0},
        {map: "HOK", picked: 0},
        {map: "MIA", picked: 0},
        {map: "SF", picked: 0},
        {map: "MUM", picked: 0},
        {map: "WC", picked: 0},
        {map: "SGA", picked: 0},
        {map: "NY", picked: 0},
        {map: "HAV", picked: 0},
        {map: "DUB", picked: 0},
        {map: "DAR", picked: 0},
        {map: "BER", picked: 0},
        {map: "CHO", picked: 0},
        {map: "MEN", picked: 0}
    ]
}

const getDefaultMapWinObj = () => {
    return [
        {map: "PAR", played: 0, won: 0},
        {map: "SAP", played: 0, won: 0},
        {map: "MAR", played: 0, won: 0},
        {map: "BKK", played: 0, won: 0},
        {map: "COL", played: 0, won: 0},
        {map: "HOK", played: 0, won: 0},
        {map: "MIA", played: 0, won: 0},
        {map: "SF", played: 0, won: 0},
        {map: "MUM", played: 0, won: 0},
        {map: "WC", played: 0, won: 0},
        {map: "SGA", played: 0, won: 0},
        {map: "NY", played: 0, won: 0},
        {map: "HAV", played: 0, won: 0},
        {map: "DUB", played: 0, won: 0},
        {map: "DAR", played: 0, won: 0},
        {map: "BER", played: 0, won: 0},
        {map: "CHO", played: 0, won: 0},
        {map: "MEN", played: 0, won: 0}
    ]
}

const getMapPicker = (picker, player1, player2) => {
    if(picker == 1) return player1;
    if(picker == 2) return player2;
    return "RNG";
}

const getMapWinner = (winner, player1, player2) => {
    if(winner == 1) return player1;
    if(winner == 2) return player2;
    return "Tie";
}