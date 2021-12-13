import { IRRMatch } from "../models/Match";

let leaderboards = {};

export async function recalculate(additionalMatches: IRRMatch[]=[]): Promise<void> {
    //TODO: Calculation
}

export async function getLeaderboardStat(stat: string, map:string = ""): Promise<object> {
    //TODO: This entire thing
    return null;
}