import { RRPlayerModel } from "../models/Player";
import { IRRRecord, RRRecordModel } from "../models/Record";
import {AuditLogModel} from "../models/AuditLogEntry";
import {jsonDiff} from "../utils";

export async function getRecords(): Promise<IRRRecord[]> {
    const records = await RRRecordModel.find({}).sort("sortingIndex").exec();
    for(const record of records) {
        for(const player in record.players) {
            const playerObject = await RRPlayerModel.findById(record.players[player]).exec();
            if(playerObject !== null) {
                record.players[player] = playerObject.name;
            }
        }
    }
    return records;
}

export async function getStoredRecords(): Promise<IRRRecord[]> {
    return await RRRecordModel.find({}).sort("sortingIndex").exec();
}

export async function editRecord(record: any, username: string): Promise<boolean> {
    const dbRecord = await RRRecordModel.findOne({_id: record._id}).exec();
    if(dbRecord == null) return false;
    Object.assign(dbRecord, record);
    await dbRecord.save();
    await AuditLogModel.newEntry(username, "Edited record " + dbRecord._id, jsonDiff(dbRecord, record));
    return true;
}

export async function addRecord(record: any, username: string): Promise<boolean> {
    delete record._id;
    await RRRecordModel.create(record);
    await AuditLogModel.newEntry(username, "Added record", {recordData: record});
    return true;
}

export async function deleteRecord(record: any, username: string): Promise<boolean> {
    await RRRecordModel.findByIdAndDelete(record._id).exec();
    await AuditLogModel.newEntry(username, "Deleted record " + record._id, {recordData: record});
    return true;
}