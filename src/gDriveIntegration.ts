import { getPlayerAbreviationOverride } from "./dataManager";

function monthToIndex(month) {
    switch(month) {
        case 'January':
            return 0
        case 'Feburary':
            return 1
        case 'March':
            return 2
        case 'April':
            return 3
        case 'May':
            return 4
        case 'June':
            return 5
        case 'July':
            return 6
        case 'August':
            return 7
        case 'September':
            return 8
        case 'October':
            return 9
        case 'November':
            return 10
        case 'December':
            return 11
        default:
            return 0
    }
}

/* column definitions:
    0-platform
    1-round
    2-player1
    3-player2
    4-score
    5-maps
    6-CEST time

    default definition:
    3 D
    4 E
    5 F
    7 H
    6 G
    [8, 10, 12] I K M
    1 B

    rrwc definition:
    0 A
    3 D
    4 E
    6 G
    5 F
    [7, 9, 11] H J L
    1 B

    [0, 3, 4, 6, 5, [7, 9, 11], 1]
*/

const GDriveObjectToMatchlist = (obj, competition="Unknown", debugLog=false, year=new Date().getFullYear(), columnDefinitions=[3, 4, 5, 7, 6, [8, 10, 12], 1]) => {
    let matches = [];

    if(debugLog) console.log("[DBG] We use new function");

    let betterData = [];

    for (let index = 0; index < obj.table.rows.length; index++) {
        let tmp = [];
        for (let index2 = 0; index2 < obj.table.cols.length; index2++) {
            tmp.push("");
        }
        betterData.push(tmp);
    }

    obj.table.rows.forEach((element, idx) => {
        element.c.forEach((element2, idx2) => {
            if(element2 !== undefined && element2 !== null) {
                if(element2.f !== undefined && element2.f !== "") {
                    betterData[idx][idx2] = element2.f;
                } else if(element2.v !== "" && element2.v !== undefined) {
                    betterData[idx][idx2] = element2.v;
                }
            }
        });
    });

    let rx = obj.table.cols[1].label.match(/.*Day \d+ - .+, (\d+)(st|nd|rd|th) (.+) CE.*/);
    let newestDayNumber = rx[1];
    let newestMonth = rx[3];

    if(debugLog) console.log(newestDayNumber);
    if(debugLog) console.log(newestMonth);

    let currentDate = new Date(year, monthToIndex(newestMonth), parseInt(newestDayNumber));
    if(debugLog) console.log(currentDate);

    if(debugLog) console.log("[DBG] Amount of rows: " + betterData.length);

    // Filtering matches by looking at the score-column[6] (let's hope In4 never changes the layout of the spreadsheet LUL)
    betterData.forEach(element => {
        //If player1 = "Result" decrement date
        if(element[columnDefinitions[2] as number] == "Result") {
            currentDate.setDate(currentDate.getDate() - 1);
        }
        if(debugLog) console.log(element[columnDefinitions[4] as number]);
        if(element[columnDefinitions[4] as number].match(/[0-9]+-[0-9]+/)) {
            if(debugLog) console.log("[DBG] First check passed")
            if(element[columnDefinitions[1] as number] == "Grand Final" || element[columnDefinitions[1] as number] == "RRWC \nGrand Final") {
                if(debugLog) {
                    console.log("[DBG] Grand final detected! Avoiding.");
                }
            } else {
                let maps = [];
                let index = 0;
                (columnDefinitions[5] as number[]).forEach(e => {
                    if(element[e] !== "" && element[e] !== "N/A" && element[e] !== "-") {
                        let wonBy = 0;
                        if(getPlayerAbreviationOverride(element[e+1]) !== "") {
                            wonBy = (getPlayerAbreviationOverride(element[e+1]) === element[columnDefinitions[2] as number]) ? 1 : 2
                        } else {
                            if(element[columnDefinitions[2] as number].toLowerCase().indexOf(element[e+1].toLowerCase()) !== -1) {
                                wonBy = 1;
                            } else if(element[columnDefinitions[3] as number].toLowerCase().indexOf(element[e+1].toLowerCase()) !== -1) {
                                wonBy = 2;
                            }
                        }
                        let picked = 0;
                        if(index == 0) {
                            picked = 1;
                        } else if(index == 1) {
                            picked = 2;
                        }
                        maps.push({
                            map: element[e],
                            winner: wonBy,
                            picked: picked
                        })

                        index++;
                    }
                });
                const scoreArr = element[columnDefinitions[4] as number].split("-");

                let winner;
                if (scoreArr[0] > scoreArr[1]) {
                    winner = 1;
                } else if (scoreArr[1] > scoreArr[0]) {
                    winner = 2;
                } else {
                    winner = 0;
                }

                let timeSplit = element[columnDefinitions[6] as number].split(":");
                let day = currentDate.getDate();
                if(timeSplit[0] < 6 || (timeSplit[0] == 6 && timeSplit[1] == 0)) {
                    day += 1;
                }

                const tmp: Match = {
                    platform: element[columnDefinitions[0] as number],
                    round: element[columnDefinitions[1] as number],
                    player1: element[columnDefinitions[2] as number],
                    player2: element[columnDefinitions[3] as number],
                    score: element[columnDefinitions[4] as number],
                    winner: (scoreArr[0] > scoreArr[1]) ? 1 : 2,
                    competition: competition,
                    maps: maps,
                    timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), day, timeSplit[0], timeSplit[1])
                }

                matches.push(tmp);
            }
        }
    });

    if(debugLog) console.log("[DBG] Amount of parsed matches: " + matches.length);

    return matches;
}

export default GDriveObjectToMatchlist;