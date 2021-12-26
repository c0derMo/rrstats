import { IRRMatch, RRMatchModel } from "../models/Match";
import { IRRPlayer, RRPlayerModel } from "../models/Player";
import { RRUserAuthType, UserModel } from "../models/User";

export async function verifyLogin(username: string, password: string): Promise<boolean> {
    let user = await UserModel.findOne({name: username}).exec();
    if(user == null) return false;
    if(user.type !== RRUserAuthType.USER) return false;
    return await user.verifyPassword(password);
}

export async function updateUserPassword(username: string, password: string): Promise<boolean> {
    let user = await UserModel.findOne({name: username}).exec();
    if(user == null) return false;
    await user.setPassword(password);
    await user.save();
    return true;
}

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
    // await patchAnything(RRPlayerModel, changes);
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