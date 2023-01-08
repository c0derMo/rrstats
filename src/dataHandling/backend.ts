import { jsonDiff } from "../utils";
import axios from "axios";
import {csvParser, ParserConfigOverrides} from "../gDriveIntegration";
import { parse } from "csv-parse";
import { database } from "../databaseManager";
import { RRUser, setPassword, verifyPassword } from "../models/User";
import { AuditLogEntry, newEntry } from "../models/AuditLogEntry";
import { RRMatch } from "../models/Match";
import { RRPlayer } from "../models/Player";
import { RRCompetiton } from "../models/Competitions";
import { RRRecord } from "../models/Record";

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
    const user = await database.getRepository(RRUser).findOneBy({ name: username });
    if(user === null) return false;
    if(user.type !== "USER") return false;
    return await verifyPassword(user, password);
}

export async function updateUserPassword(username: string, password: string): Promise<boolean> {
    const user = await database.getRepository(RRUser).findOneBy({ name: username });
    if(user === null) return false;
    await setPassword(user, password);
    await newEntry(username, "Changed own password");
    return true;
}

export async function getStoredMatches(): Promise<RRMatch[]> {
    return await database.getRepository(RRMatch).find();
}

export async function editMatch(match: RRMatch, username: string): Promise<boolean> {
    const dbMatch = await database.getRepository(RRMatch).findOneBy({ uuid: match.uuid });
    if(dbMatch === null) return false;
    Object.assign(dbMatch, match);
    await database.getRepository(RRMatch).save(dbMatch);
    await newEntry(username, "Edited match " + dbMatch.uuid, jsonDiff(dbMatch, match) as Record<number, unknown>);
    return true;
}

export async function addMatch(match: RRMatch, username: string): Promise<boolean> {
    delete match.uuid;
    await database.getRepository(RRMatch).save(match);
    await newEntry(username, "Added match", {matchData: match});
    return true;
}

export async function deleteMatch(match: RRMatch, username: string): Promise<boolean> {
    await database.getRepository(RRMatch).delete({ uuid: match.uuid });
    await newEntry(username, "Deleted match " + match.uuid, {matchData: match});
    return true;
}

export async function getAllPlayers(): Promise<RRPlayer[]> {
    return await database.getRepository(RRPlayer).find();
}

export async function patchPlayers(changes: { [key: string]: string }, username: string): Promise<boolean> {
    for(const change in changes) {
        const split = change.split(";");
        const element = await database.getRepository(RRPlayer).findOneBy({ uuid: split[0] });
        element[split[1]] = changes[change];
        await database.getRepository(RRPlayer).save(element);
    }
    await newEntry(username, "Edited players", {changes});
    return true;
}

export async function importSpreadsheet(options: SpreadsheetImportOptions, username: string): Promise<number> {
    if(options.id === "" || options.gid === "" || options.comp === "") return -1;
    const req = await axios.get(`https://docs.google.com/spreadsheets/d/e/${options.id}/pub?gid=${options.gid}&single=true&output=csv`);
    const parsedCSV = parse(req.data as string);
    if(options.parserOptions === "" || options.parserOptions === undefined) options.parserOptions = "{}";
    const matches = await csvParser(parsedCSV, options.comp, JSON.parse(options.parserOptions) as ParserConfigOverrides);
    for(const match of matches) {
        await database.getRepository(RRMatch).save(match);
    }
    await newEntry(username, "Imported competition " + options.comp, {options: options, amountMatches: matches.length});
    return matches.length;
}

export async function importStandings(options: StandingsImportOptions, username: string): Promise<object> {
    if(options.compId === "" || options.placements?.length <= 0) return {success: false, error: "Fill in the required fields"}

    let placements = 0;
    const notFoundPlayers = [];
    const competition = await database.getRepository(RRCompetiton).findOneBy({ uuid: options.compId });
    for(const placement of options.placements) {
        const player = await database.getRepository(RRPlayer).findOneBy({ name: placement.player });
        if(player === null) {
            notFoundPlayers.push(placement.player);
        } else {
            competition.placements.push({
                playerId: player.uuid,
                bracket: options.bracket,
                placement: placement.placement
            });
            placements += 1;
        }
    }
    await database.getRepository(RRCompetiton).save(competition);
    await newEntry(username, "Imported standings " + competition.name + " - " + options.bracket, {placements: options.placements});

    return {
        success: true,
        amountPlacements: placements,
        notFoundPlayers: notFoundPlayers
    }
}

export async function renamePlayer(oldName: string, newName: string, username: string): Promise<string[]> {
    const changes = [] as string[];

    const players = await database.getRepository(RRPlayer).findBy({ name: oldName });
    for(const player of players) {
        player.name = newName;
        await database.getRepository(RRPlayer).save(player);
        changes.push(`Changed RRPlayer ${player.uuid} from ${oldName} to name ${newName}`);
    }

    const matches = await database.getRepository(RRMatch).findBy( [ { player1: oldName }, { player2: oldName } ] );
    for(const match of matches) {
        if(match.player1 === oldName) {
            match.player1 = newName;
            changes.push(`Changed player 1 in match ${match.uuid} from ${oldName} to ${newName}`);
        } else if(match.player2 === oldName) {
            match.player2 = newName;
            changes.push(`Changed player 2 in match ${match.uuid} from ${oldName} to ${newName}`);
        }
        await database.getRepository(RRMatch).save(match);
    }

    const records = await database.getRepository(RRRecord).find();
    for(const record of records) {
        if(record.match.search(oldName) >= 0) {
            changes.push(`Record ${record.uuid} changed match from ${record.match} to ${record.match.replace(oldName, newName)}`)
            record.match = record.match.replace(oldName, newName);
            await database.getRepository(RRRecord).save(record);
        }
    }

    await newEntry(username, "Renamed player " + oldName +  " to " + newName, {changes: changes});

    return changes;
}

export async function getAuditLogs(search: string, itemsPerPage: number, page: number): Promise<object> {
    let query = database.getRepository(AuditLogEntry).createQueryBuilder("log");
    if (search !== "") {
        query = query.where("log.user LIKE :search", { search: `%${search}%` })
            .orWhere("log.action LIKE :search", { search: `%${search}%` });
    } else {
        query = query.orderBy("log.timestamp", "DESC");
    }
    if(page > 1) {
        query = query.skip((page - 1) * itemsPerPage);
    }
    if(itemsPerPage > 0) {
        query = query.limit(itemsPerPage);
    }
    const items = await query.getMany();
    const count = await database.getRepository(AuditLogEntry).count();
    return {
        itemCount: count,
        items: items
    }
}

export async function getStoredCompetitions(): Promise<RRCompetiton[]> {
    return (await database.getRepository(RRCompetiton).find({ order: { sortingIndex: "DESC" }}));
}

export async function editCompetition(comp: RRCompetiton, username: string): Promise<boolean> {
    const dbComp = await database.getRepository(RRCompetiton).findOneBy({ uuid: comp.uuid });
    if(dbComp === null) return false;
    Object.assign(dbComp, comp);
    await database.getRepository(RRCompetiton).save(dbComp);
    await newEntry(username, "Edited competition " + dbComp.uuid, jsonDiff(dbComp, comp) as Record<number, unknown>);
    return true;
}

export async function addCompetition(comp: RRCompetiton, username: string): Promise<boolean> {
    delete comp.uuid;
    await database.getRepository(RRCompetiton).save(comp);
    await newEntry(username, "Added competition", {compData: comp});
    return true;
}

export async function deleteCompetition(comp: RRCompetiton, username: string): Promise<boolean> {
    await database.getRepository(RRCompetiton).delete({ uuid: comp.uuid });
    await newEntry(username, "Deleted competition " + comp.uuid, {compData: comp});
    return true;
}

export async function lookupPlayer(info: string, type: string): Promise<object> {
    if(type === "id") {
        return await database.getRepository(RRPlayer).findOneBy({ uuid: info });
    } else if(type === "name") {
        return await database.getRepository(RRPlayer).findOneBy({ name: info });
    } else {
        return {name: '', uuid: ''}
    }
}
