import { Model } from "mongoose";
import { IRRMatch, RRMatchModel } from "../models/Match";
import { IRRPlayer, RRPlayerModel } from "../models/Player";
import { setJSONPath } from "../utils";

export async function getStoredMatches(): Promise<IRRMatch[]> {
    return await RRMatchModel.find().exec();
}

export async function editMatch(match: any): Promise<boolean> {
    try {
        let dbMatch = await RRMatchModel.findOne({_id: match._id}).exec();
        if(dbMatch == null) return false;
        Object.assign(dbMatch, match);
        await dbMatch.save();
        return true;
    } catch(e) {
        console.log(e);
        return false;
    }
}

export async function addMatch(match: any): Promise<boolean> {
    delete match._id;
    await RRMatchModel.create(match);
    return true;
}

export async function deleteMatch(match: any): Promise<boolean> {
    await RRMatchModel.findByIdAndDelete(match._id).exec();
    return true;
}

export async function getAllPlayers(): Promise<IRRPlayer[]> {
    return await RRPlayerModel.find({}).exec();
}

export async function patchPlayers(changes: Object): Promise<boolean> {
    await patchAnything(RRPlayerModel, changes);
    return true;
}

export async function importSpreadsheet(sheetId: string, tabName: string, competition: string, columnAssignments: object, year: number): Promise<number> {
    //TODO: Import
    return 0
}

export async function renamePlayer(oldName: string, newName: string): Promise<object> {
    //TODO: Renaming algorithm
    return null;
}

async function patchAnything(model: Model<any>, changes: Object): Promise<void> {
    for(let key in changes) {
        let matchId = key.split(";")[0];
        let path = key.split(";")[1];

        let match = await model.findById(matchId).exec();
        setJSONPath(match, path, changes[key]);
        await match.save();
    }
}