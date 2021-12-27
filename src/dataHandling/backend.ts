import { IRRMatch, RRMatchModel } from "../models/Match";
import { IRRPlayer, RRPlayerModel } from "../models/Player";
import { UserModel } from "../models/User";
import { AuditLogModel } from '../models/AuditLogEntry';
import { jsonDiff } from "../utils";

export async function verifyLogin(username: string, password: string): Promise<boolean> {
    let user = await UserModel.findOne({name: username}).exec();
    if(user == null) return false;
    if(user.type !== "USER") return false;
    return await user.verifyPassword(password);
}

export async function updateUserPassword(username: string, password: string): Promise<boolean> {
    let user = await UserModel.findOne({name: username}).exec();
    if(user == null) return false;
    await user.setPassword(password);
    await user.save();
    await AuditLogModel.newEntry(username, "Changed own password");
    return true;
}

export async function getStoredMatches(): Promise<IRRMatch[]> {
    return await RRMatchModel.find().exec();
}

export async function editMatch(match: any, username: string): Promise<boolean> {
    let dbMatch = await RRMatchModel.findOne({_id: match._id}).exec();
    if(dbMatch == null) return false;
    await AuditLogModel.newEntry(username, "Edited match " + dbMatch._id, jsonDiff(dbMatch, match));
    Object.assign(dbMatch, match);
    await dbMatch.save();
    return true;
}

export async function addMatch(match: any, username: string): Promise<boolean> {
    delete match._id;
    await RRMatchModel.create(match);
    await AuditLogModel.newEntry(username, "Added match", {matchData: match});
    return true;
}

export async function deleteMatch(match: any, username: string): Promise<boolean> {
    await RRMatchModel.findByIdAndDelete(match._id).exec();
    await AuditLogModel.newEntry(username, "Deleted match " + match._id, {matchData: match});
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

export async function getAuditLogs(search: string, itemsPerPage: number, page: number): Promise<object> {
    let itemsQuery;
    if(search == "") {
        itemsQuery = AuditLogModel.find({}).sort('-timestamp');
    } else {
        itemsQuery = AuditLogModel.find({ $or: [{ user: { $regex: search, $options: 'i' }}, { action: { $regex: search, $options: 'i' } }] })
    }
    if(page > 1) {
        itemsQuery = itemsQuery.skip((page-1) * itemsPerPage);
    }
    let items = await itemsQuery.limit(itemsPerPage).exec();
    let count = await AuditLogModel.countDocuments({});
    return {
        itemCount: count,
        items: items
    }
}