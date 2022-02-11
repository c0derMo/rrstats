import { DateTime } from "luxon";
import {IRRBan, IRRMap, IRRMatch} from "./models/Match";
import { RRPlayerModel } from "./models/Player";
import {Parser} from "csv-parse";

function monthToIndex(month: string): number {
    switch(month) {
        case 'January':
            return 1
        case 'Feburary':
            return 2
        case 'March':
            return 3
        case 'April':
            return 4
        case 'May':
            return 5
        case 'June':
            return 6
        case 'July':
            return 7
        case 'August':
            return 8
        case 'September':
            return 9
        case 'October':
            return 10
        case 'November':
            return 11
        case 'December':
            return 12
        default:
            return 1
    }
}
function isMap(map: string): boolean {
    return ["PAR", "SAP", "MAR", "BKK", "COL", "HOK", "MIA", "SF", "MUM", "WC", "SGA", "NY", "HAV", "DUB", "DAR", "BER", "CHO", "MEN"].includes(map);
}
function defaultParserConfig(): ParserConfig {
    return {
        year: new Date().getFullYear(),
        headers: {
            timeHeader: "CET",
            bracketRoundHeader: "Bracket/Round",
            resultHeader: "Result",
            mapsHeader: "Maps",
            bansHeader: "Bans",
            shoutcastHeader: "Shoutcast"
        },
        debugLog: false,
        dayRegex: ".*Day \\d+ - .+, (\\d+)(st|nd|rd|th) (.+)",
        hasBracket: true
    }
}

interface ParserConfig {
    year: number;
    headers: {
        timeHeader: string,
        bracketRoundHeader: string,
        resultHeader: string,
        mapsHeader: string,
        bansHeader: string,
        shoutcastHeader: string
    },
    debugLog: boolean,
    dayRegex: string,
    hasBracket: boolean
}
export interface ParserConfigOverrides {
    year?: number;
    headers?: {
        timeHeader?: string,
        bracketRoundHeader?: string,
        resultHeader?: string,
        mapsHeader?: string,
        bansHeader?: string,
        shoutcastHeader?: string
    },
    debugLog?: boolean,
    dayRegex?: string,
    hasBracket?: boolean
}

export async function csvParser(obj: Parser, competition: string, configOverrides: ParserConfigOverrides={}): Promise<IRRMatch[]> {
    if(configOverrides == undefined) configOverrides = {};

    const config = Object.assign({}, defaultParserConfig());
    for(const key in config) {
        if(configOverrides[key] !== undefined) {
            if(typeof configOverrides[key] === "object") {
                Object.assign(config[key], configOverrides[key]);
            } else {
                Object.assign(config, { [key]: configOverrides[key] as unknown });
            }
        }
    }

    if(config.debugLog) console.log(configOverrides);
    if(config.debugLog) console.log(config);

    const matches = [] as IRRMatch[];

    let date: DateTime;
    let timeCol = -1;
    let bracketRoundCol = -1;
    let resultCol = -1;
    let mapsCol = -1;
    let bansCol = -1;
    let shoutcastCol = -1;

    // Grabbing all the abbreviation overrides once to avoid long database queries
    const abbreviationOverrides = {};
    const abbreviationOverridesQuery = await RRPlayerModel.find({ abbreviationOverride: {$ne: null} }).exec();
    abbreviationOverridesQuery.forEach(e => {
        if(e.abbreviationOverride !== "") {
            abbreviationOverrides[e.abbreviationOverride] = e.name;
        }
    });
    if(config.debugLog) console.log(abbreviationOverrides);

    for await(const lineWrap of obj) {
        const line = lineWrap as string[];
        if(config.debugLog) console.log(line);
        for(let colIndex = 0; colIndex < line.length; colIndex++) {
            const col = line[colIndex];
            // Check for date
            const dateMatch = col.match(config.dayRegex);
            if(dateMatch) {
                date = DateTime.fromObject({year: config.year, month: monthToIndex(dateMatch[3]), day: parseInt(dateMatch[1])}, {zone:'Europe/Berlin'});
                if(config.debugLog) console.log(date.toString());
            }

            // Check for Header
            switch (col) {
                case config.headers.bansHeader:
                    if(config.debugLog) console.log(`New Bans Column: ${colIndex}`);
                    bansCol = colIndex;
                    break;
                case config.headers.mapsHeader:
                    if(config.debugLog) console.log(`New Maps Column: ${colIndex}`);
                    mapsCol = colIndex;
                    break;
                case config.headers.timeHeader:
                    if(config.debugLog) console.log(`New Time Column: ${colIndex}`);
                    timeCol = colIndex;
                    break;
                case config.headers.resultHeader:
                    if(config.debugLog) console.log(`New Result Column: ${colIndex}`);
                    resultCol = colIndex;
                    break;
                case config.headers.shoutcastHeader:
                    if(config.debugLog) console.log(`New Shoutcast Column: ${colIndex}`);
                    shoutcastCol = colIndex;
                    break;
                case config.headers.bracketRoundHeader:
                    if(config.debugLog) console.log(`New Bracket Column: ${colIndex}`);
                    bracketRoundCol = colIndex;
                    break;
            }
        }

        if(line[resultCol+1].match(/[0-9]+-[0-9]+/)) {
            // We got a match everyone
            let datetime: DateTime;
            if(line[timeCol].toLowerCase() == "n/a") {
                datetime = DateTime.fromObject({year: date.year, month: date.month, day: date.day}, {zone: date.zoneName});
            } else {
                const timeSplit = line[timeCol].split(":");
                datetime = DateTime.fromObject({year: date.year, month: date.month, day: date.day, hour: parseInt(timeSplit[0]), minute: parseInt(timeSplit[1])}, {zone: date.zoneName});
                if(parseInt(timeSplit[0]) < 6 || (parseInt(timeSplit[0]) == 6 && parseInt(timeSplit[1]) == 0)) {
                    datetime = datetime.plus({days: 1});
                }
            }
            let bracket = "", round = "";
            if(config.hasBracket) {
                bracket = line[bracketRoundCol];
                round = line[bracketRoundCol+1];
            } else {
                round = line[bracketRoundCol];
            }
            const player1 = line[resultCol].replace(" [C]", "").replace(" [PC]", "").replace(" [XB]", "").replace(" [PS]", "");
            const player2 = line[resultCol+2].replace(" [C]", "").replace(" [PC]", "").replace(" [XB]", "").replace(" [PS]", "");
            const scoreSplit = line[resultCol+1].split("-");
            const score = {
                player1Points: parseInt(scoreSplit[0]),
                player2Points: parseInt(scoreSplit[1]),
                winner: 0
            };
            if(score.player2Points > score.player1Points) score.winner = 2;
            if(score.player1Points > score.player2Points) score.winner = 1;

            const maps = [] as IRRMap[];

            let sortedHeaders = [timeCol, bracketRoundCol, resultCol, mapsCol, bansCol, shoutcastCol].sort()
                .filter(e => e > mapsCol);   // Filter out everything thats smaller than maps
            if(config.debugLog) console.log(sortedHeaders);
            for(let mIdx=mapsCol; mIdx < sortedHeaders[0]; mIdx += 2) {
                if(!isMap(line[mIdx])) break;       // We break upon the first non-map
                if(line[mIdx+1] == "") continue;    // We skip over maps with "no winner"

                const map = {
                    map: line[mIdx],
                    winner: 0,
                    pickedBy: 0
                }

                if(maps.length == 0) map.pickedBy = 1;
                if(maps.length == 1) map.pickedBy = 2;

                if(abbreviationOverrides[line[mIdx+1]] !== undefined) {
                    map.winner = (abbreviationOverrides[line[mIdx+1]] == player1) ? 1 : 2
                } else {
                    if(player1.toLowerCase().indexOf(line[mIdx+1].toLowerCase()) !== -1) {
                        map.winner = 1;
                    } else if(player2.toLowerCase().indexOf(line[mIdx+1].toLowerCase()) !== -1) {
                        map.winner = 2;
                    }
                }

                maps.push(map);
            }

            const bans = [] as IRRBan[];

            sortedHeaders = [timeCol, bracketRoundCol, resultCol, mapsCol, bansCol, shoutcastCol].sort()
                .filter(e => e > bansCol);   // Filter out everything thats smaller than maps
            for(let bIdx=bansCol; bIdx<sortedHeaders[0]; bIdx++) {
                if(!isMap(line[bIdx])) break;
                const ban = {
                    map: line[bIdx],
                    bannedBy: 0
                }
                if(bans.length == 0) ban.bannedBy = 1;
                if(bans.length == 1) ban.bannedBy = 2;

                bans.push(ban);
            }

            const match: IRRMatch = {
                bans: bans,
                competition: competition.replace("\n", ""),
                maps: maps,
                platform: bracket.replace("\n", ""),
                player1: player1.replace("\n", ""),
                player2: player2.replace("\n", ""),
                round: round.replace("\n", ""),
                score: score,
                timestamp: datetime.toJSDate()
            }

            matches.push(match);
        } else if(isMap(line[mapsCol]) && line[resultCol+1] !== "-") {
            // Two liner detected!
            const mapsToAddTo = matches[matches.length-1].maps;
            const player1 = matches[matches.length-1].player1;
            const player2 = matches[matches.length-1].player2;

            const sortedHeaders = [timeCol, bracketRoundCol, resultCol, mapsCol, bansCol, shoutcastCol].sort()
                .filter(e => e > mapsCol);   // Filter out everything thats smaller than maps
            if(config.debugLog) console.log(sortedHeaders);
            for(let mIdx=mapsCol; mIdx < sortedHeaders[0]; mIdx += 2) {
                if(!isMap(line[mIdx])) break;       // We break upon the first non-map
                if(line[mIdx+1] == "") continue;    // We skip over maps with "no winner"

                const map = {
                    map: line[mIdx],
                    winner: 0,
                    pickedBy: 0
                }

                if(mapsToAddTo.length == 0) map.pickedBy = 1;
                if(mapsToAddTo.length == 1) map.pickedBy = 2;

                if(abbreviationOverrides[line[mIdx+1]] !== undefined) {
                    map.winner = (abbreviationOverrides[line[mIdx+1]] == player1) ? 1 : 2
                } else {
                    if(player1.toLowerCase().indexOf(line[mIdx+1].toLowerCase()) !== -1) {
                        map.winner = 1;
                    } else if(player2.toLowerCase().indexOf(line[mIdx+1].toLowerCase()) !== -1) {
                        map.winner = 2;
                    }
                }

                mapsToAddTo.push(map);
            }
        }
    }
    return matches;
}
