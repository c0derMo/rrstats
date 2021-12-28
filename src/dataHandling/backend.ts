import { IRRMatch, RRMatchModel } from "../models/Match";
import { IRRPlayer, RRPlayerModel } from "../models/Player";
import { UserModel } from "../models/User";
import { AuditLogModel } from '../models/AuditLogEntry';
import { jsonDiff } from "../utils";
import { RRCompetitionModel, IRRCompetition } from "../models/Competitions";
import axios from "axios";
import gdriveObjectToMatchArray from "../gDriveIntegration";

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

export async function patchPlayers(changes: Object, username: string): Promise<boolean> {
    for(let change in changes) {
        let split = change.split(";");
        let element = await RRPlayerModel.findOne({_id: split[0]}).exec();
        element[split[1]] = changes[change];
        await element.save();
    }
    await AuditLogModel.newEntry(username, "Edited players", {changes});
    return true;
}

export async function importSpreadsheet(options: any, username: string): Promise<number> {
    if(options.id == "" || options.tabName == "" || options.comp == "") return -1;
    let req = await axios.get("https://docs.google.com/spreadsheets/d/" + options.id + "/gviz/tq?tqx=out:json&sheet=" + options.tabName);
    if(options.year == "") {
        options.year = new Date().getFullYear();
    } else {
        options.year = parseInt(options.year);
    }
    let matches;
    if(options.columnOverride !== "") {
        matches = await gdriveObjectToMatchArray(JSON.parse(req.data.substring(47, req.data.length-2)), options.comp, false, options.year, JSON.parse(options.columnOverride));
    } else {
        matches = await gdriveObjectToMatchArray(JSON.parse(req.data.substring(47, req.data.length-2)), options.comp, false, options.year);
    }
    for(let match of matches) {
       await RRMatchModel.create(match);
    }
    await AuditLogModel.newEntry(username, "Imported competition " + options.comp, {options: options, amountMatches: matches.length});
    return matches.length;
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

export async function getStoredCompetitions(): Promise<IRRCompetition[]> {
    return await RRCompetitionModel.find().exec();
}

export async function editCompetition(comp: any, username: string): Promise<boolean> {
    let dbComp = await RRCompetitionModel.findOne({_id: comp._id}).exec();
    if(dbComp == null) return false;
    await AuditLogModel.newEntry(username, "Edited competition " + dbComp._id, jsonDiff(dbComp, comp));
    Object.assign(dbComp, comp);
    await dbComp.save();
    return true;
}

export async function addCompetition(comp: any, username: string): Promise<boolean> {
    delete comp._id;
    await RRCompetitionModel.create(comp);
    await AuditLogModel.newEntry(username, "Added competition", {compData: comp});
    return true;
}

export async function deleteCompetition(comp: any, username: string): Promise<boolean> {
    await RRCompetitionModel.findByIdAndDelete(comp._id).exec();
    await AuditLogModel.newEntry(username, "Deleted competition " + comp._id, {compData: comp});
    return true;
}

export async function lookupPlayer(info: string, type: string): Promise<object> {
    if(type == "id") {
        return await RRPlayerModel.findOne({_id: info}).exec();
    } else if(type == "name") {
        return await RRPlayerModel.findOne({name: info}).exec();
    } else {
        return {name: '', _id: ''}
    }
}