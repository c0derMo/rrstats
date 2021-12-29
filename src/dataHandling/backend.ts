import { IRRMatch, RRMatchModel } from "../models/Match";
import { IRRPlayer, RRPlayerModel } from "../models/Player";
import { UserModel } from "../models/User";
import { AuditLogModel } from '../models/AuditLogEntry';
import { jsonDiff } from "../utils";
import { RRCompetitionModel, IRRCompetition } from "../models/Competitions";
import axios from "axios";
import gdriveObjectToMatchArray from "../gDriveIntegration";
import {RRRecordModel} from "../models/Record";

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

export async function importStandings(options: any, username: string): Promise<object> {
    if(options.compId == "" || options.bracket == "" || options.placements == []) return {success: false}

    let placements = 0;
    let notFoundPlayers = [];
    let competition = await RRCompetitionModel.findOne({_id: options.compId}).exec();
    for(let placement of options.placements) {
        let player = await RRPlayerModel.findOne({name: placement.player}).exec();
        if(player == null) {
            notFoundPlayers.push(placement.player);
        } else {
            competition.placements.push({
                playerId: player._id,
                bracket: options.bracket,
                placement: placement.placement
            });
            placements += 1;
        }
    }
    await competition.save();
    await AuditLogModel.newEntry(username, "Imported standings " + competition.name + " - " + options.bracket, {placements: options.placements});

    return {
        success: true,
        amountPlacements: placements,
        notFoundPlayers: notFoundPlayers
    }
}

export async function renamePlayer(oldName: string, newName: string, username: string): Promise<object> {
    let changes = [];
    
    let players = await RRPlayerModel.find({name: oldName}).exec();
    for(let player of players) {
        player.name = newName;
        await player.save();
        changes.push(`Changed RRPlayer ${player._id} from ${oldName} to name ${newName}`);
    }
    
    let matches = await RRMatchModel.find({ $or: [{player1: oldName}, {player2: oldName}] }).exec();
    for(let match of matches) {
        if(match.player1 == oldName) {
            match.player1 = newName;
            changes.push(`Changed player 1 in match ${match._id} from ${oldName} to ${newName}`);
        } else if(match.player2 == oldName) {
            match.player2 = newName;
            changes.push(`Changed player 2 in match ${match._id} from ${oldName} to ${newName}`);
        }
        await match.save();
    }

    let records = await RRRecordModel.find({}).exec();
    for(let record of records) {
        if(record.match.search(oldName) >= 0) {
            changes.push(`Record ${record._id} changed match from ${record.match} to ${record.match.replace(oldName, newName)}`)
            record.match = record.match.replace(oldName, newName);
            await record.save();
        }
    }

    await AuditLogModel.newEntry(username, "Renamed player " + oldName +  " to " + newName, {changes: changes});

    return { success: true, changes: changes };
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
    return await RRCompetitionModel.find().sort("-sortingIndex").exec();
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