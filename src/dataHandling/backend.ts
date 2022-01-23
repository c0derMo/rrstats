import {IMatchDocument, IRRMatch, RRMatchModel} from "../models/Match";
import { IRRPlayer, RRPlayerModel } from "../models/Player";
import { UserModel } from "../models/User";
import { AuditLogModel } from '../models/AuditLogEntry';
import { jsonDiff } from "../utils";
import {RRCompetitionModel, IRRCompetition, ICompetitionDocument} from "../models/Competitions";
import axios from "axios";
import {csvParser, ParserConfigOverrides} from "../gDriveIntegration";
import {RRRecordModel} from "../models/Record";
import { parse } from "csv-parse";
import {Query, Types} from "mongoose";

export interface SpreadsheetImportOptions {
    id: string;
    gid: string;
    comp: string;
    parserOptions: string;
}

interface ImportCompetitionPlacement {
    player: string;
    placement: number;
}

export interface StandingsImportOptions {
    compId: string;
    placements: ImportCompetitionPlacement[];
    bracket: string;
}

export async function verifyLogin(username: string, password: string): Promise<boolean> {
    const user = await UserModel.findOne({name: username}).exec();
    if(user == null) return false;
    if(user.type !== "USER") return false;
    return await user.verifyPassword(password);
}

export async function updateUserPassword(username: string, password: string): Promise<boolean> {
    const user = await UserModel.findOne({name: username}).exec();
    if(user == null) return false;
    await user.setPassword(password);
    await user.save();
    await AuditLogModel.newEntry(username, "Changed own password");
    return true;
}

export async function getStoredMatches(): Promise<IRRMatch[]> {
    return await RRMatchModel.find().exec();
}

export async function editMatch(match: IMatchDocument, username: string): Promise<boolean> {
    const dbMatch = await RRMatchModel.findOne({_id: (match._id as Types.ObjectId).toString()}).exec();
    if(dbMatch == null) return false;
    Object.assign(dbMatch, match);
    await dbMatch.save();
    await AuditLogModel.newEntry(username, "Edited match " + (dbMatch._id as Types.ObjectId).toString(), jsonDiff(dbMatch, match));
    return true;
}

export async function addMatch(match: IMatchDocument, username: string): Promise<boolean> {
    delete match._id;
    await RRMatchModel.create(match);
    await AuditLogModel.newEntry(username, "Added match", {matchData: match});
    return true;
}

export async function deleteMatch(match: IMatchDocument, username: string): Promise<boolean> {
    await RRMatchModel.findByIdAndDelete(match._id).exec();
    await AuditLogModel.newEntry(username, "Deleted match " + (match._id as Types.ObjectId).toString(), {matchData: match});
    return true;
}

export async function getAllPlayers(): Promise<IRRPlayer[]> {
    return await RRPlayerModel.find({}).exec();
}

export async function patchPlayers(changes: { [key: string]: string }, username: string): Promise<boolean> {
    for(const change in changes) {
        const split = change.split(";");
        const element = await RRPlayerModel.findOne({_id: split[0]}).exec();
        element[split[1]] = changes[change];
        await element.save();
    }
    await AuditLogModel.newEntry(username, "Edited players", {changes});
    return true;
}

export async function importSpreadsheet(options: SpreadsheetImportOptions, username: string): Promise<number> {
    if(options.id == "" || options.gid == "" || options.comp == "") return -1;
    const req = await axios.get(`https://docs.google.com/spreadsheets/d/e/${options.id}/pub?gid=${options.gid}&single=true&output=csv`);
    const parsedCSV = parse(req.data as string);
    if(options.parserOptions == "" || options.parserOptions == undefined) options.parserOptions = "{}";
    const matches = await csvParser(parsedCSV, options.comp, JSON.parse(options.parserOptions) as ParserConfigOverrides);
    for(const match of matches) {
        await RRMatchModel.create(match);
    }
    await AuditLogModel.newEntry(username, "Imported competition " + options.comp, {options: options, amountMatches: matches.length});
    return matches.length;
}

export async function importStandings(options: StandingsImportOptions, username: string): Promise<object> {
    if(options.compId == "" || options.placements == []) return {success: false, error: "Fill in the required fields"}

    let placements = 0;
    const notFoundPlayers = [];
    const competition = await RRCompetitionModel.findOne({_id: options.compId}).exec();
    for(const placement of options.placements) {
        const player = await RRPlayerModel.findOne({name: placement.player}).exec();
        if(player == null) {
            notFoundPlayers.push(placement.player);
        } else {
            competition.placements.push({
                playerId: (player._id as Types.ObjectId).toString(),
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

export async function renamePlayer(oldName: string, newName: string, username: string): Promise<string[]> {
    const changes = [] as string[];

    const players = await RRPlayerModel.find({name: oldName}).exec();
    for(const player of players) {
        player.name = newName;
        await player.save();
        changes.push(`Changed RRPlayer ${(player._id as Types.ObjectId).toString()} from ${oldName} to name ${newName}`);
    }

    const matches = await RRMatchModel.find({ $or: [{player1: oldName}, {player2: oldName}] }).exec();
    for(const match of matches) {
        if(match.player1 == oldName) {
            match.player1 = newName;
            changes.push(`Changed player 1 in match ${(match._id as Types.ObjectId).toString()} from ${oldName} to ${newName}`);
        } else if(match.player2 == oldName) {
            match.player2 = newName;
            changes.push(`Changed player 2 in match ${(match._id as Types.ObjectId).toString()} from ${oldName} to ${newName}`);
        }
        await match.save();
    }

    const records = await RRRecordModel.find({}).exec();
    for(const record of records) {
        if(record.match.search(oldName) >= 0) {
            changes.push(`Record ${(record._id as Types.ObjectId).toString()} changed match from ${record.match} to ${record.match.replace(oldName, newName)}`)
            record.match = record.match.replace(oldName, newName);
            await record.save();
        }
    }

    await AuditLogModel.newEntry(username, "Renamed player " + oldName +  " to " + newName, {changes: changes});

    return changes;
}

export async function getAuditLogs(search: string, itemsPerPage: number, page: number): Promise<object> {
    let itemsQuery: Query<unknown, unknown>;
    if(search == "") {
        itemsQuery = AuditLogModel.find({}).sort('-timestamp');
    } else {
        itemsQuery = AuditLogModel.find({ $or: [{ user: { $regex: search, $options: 'i' }}, { action: { $regex: search, $options: 'i' } }] })
    }
    if(page > 1) {
        itemsQuery = itemsQuery.skip((page-1) * itemsPerPage);
    }
    if(itemsPerPage > 0) {
        itemsQuery = itemsQuery.limit(itemsPerPage);
    }
    const items = await itemsQuery.exec();
    const count = await AuditLogModel.countDocuments({});
    return {
        itemCount: count,
        items: items
    }
}

export async function getStoredCompetitions(): Promise<IRRCompetition[]> {
    return await RRCompetitionModel.find().sort("-sortingIndex").exec();
}

export async function editCompetition(comp: ICompetitionDocument, username: string): Promise<boolean> {
    const dbComp = await RRCompetitionModel.findOne({_id: (comp._id as Types.ObjectId).toString()}).exec();
    if(dbComp == null) return false;
    Object.assign(dbComp, comp);
    await dbComp.save();
    await AuditLogModel.newEntry(username, "Edited competition " + (dbComp._id as Types.ObjectId).toString(), jsonDiff(dbComp, comp));
    return true;
}

export async function addCompetition(comp: ICompetitionDocument, username: string): Promise<boolean> {
    delete comp._id;
    await RRCompetitionModel.create(comp);
    await AuditLogModel.newEntry(username, "Added competition", {compData: comp});
    return true;
}

export async function deleteCompetition(comp: ICompetitionDocument, username: string): Promise<boolean> {
    await RRCompetitionModel.findByIdAndDelete(comp._id).exec();
    await AuditLogModel.newEntry(username, "Deleted competition " + (comp._id as Types.ObjectId).toString(), {compData: comp});
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
