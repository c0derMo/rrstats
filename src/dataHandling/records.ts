import { database } from "../databaseManager";
import { newEntry } from "../models/AuditLogEntry";
import { RRPlayer } from "../models/Player";
import { RRRecord } from "../models/Record";
import {jsonDiff} from "../utils";

export async function getRecords(filter?: string): Promise<RRRecord[]> {
    let filterObj = {};
    if(filter) {
        filterObj = { category: filter };
    }
    const records = await database.getRepository(RRRecord).findBy(filterObj);
    for(const record of records) {
        for(let player = 0; player < record.players.length; player++) {
            try {
                const playerObject = await database.getRepository(RRPlayer).findOneBy({ uuid: record.players[player] });
                if(playerObject !== null) {
                    record.players[player] = playerObject.name;
                }
            } catch {} // eslint-disable-line
        }
    }
    return records;
}

export async function getStoredRecords(): Promise<RRRecord[]> {
    return await database.getRepository(RRRecord).find({ order: { sortingIndex: "ASC" }});
}

export async function editRecord(record: RRRecord, username: string): Promise<boolean> {
    const dbRecord = await database.getRepository(RRRecord).findOneBy({ uuid: record.uuid });
    if(dbRecord === null) return false;
    Object.assign(dbRecord, record);
    await database.getRepository(RRRecord).save(dbRecord);
    await newEntry(username, "Edited record " + dbRecord.uuid, jsonDiff(dbRecord, record) as Record<number, unknown>);
    return true;
}

export async function addRecord(record: RRRecord, username: string): Promise<boolean> {
    delete record.uuid;
    await database.getRepository(RRRecord).save(record);
    await newEntry(username, "Added record", {recordData: record});
    return true;
}

export async function deleteRecord(record: RRRecord, username: string): Promise<boolean> {
    await database.getRepository(RRRecord).delete({ uuid: record.uuid });
    await newEntry(username, "Deleted record " + record.uuid, {recordData: record});
    return true;
}
