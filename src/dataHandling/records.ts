import { RRPlayerModel } from "../models/Player";
import { IRRRecord, RRRecordModel } from "../models/Record";
import {AuditLogModel} from "../models/AuditLogEntry";
import {jsonDiff} from "../utils";

export async function getRecords(): Promise<IRRRecord[]> {
    let records = await RRRecordModel.find({}).sort("sortingIndex").exec();
    for(let record of records) {
        for(let player in record.players) {
            try {
                let playerObject = await RRPlayerModel.findById(record.players[player]).exec();
                record.players[player] = playerObject.name;
            } catch(e) {}
        }
    }
    return records;
}

export async function getStoredRecords(): Promise<IRRRecord[]> {
    return await RRRecordModel.find({}).sort("sortingIndex").exec();
}

export async function editRecord(record: any, username: string): Promise<boolean> {
    let dbRecord = await RRRecordModel.findOne({_id: record._id}).exec();
    if(dbRecord == null) return false;
    await AuditLogModel.newEntry(username, "Edited record " + dbRecord._id, jsonDiff(dbRecord, record));
    Object.assign(dbRecord, record);
    await dbRecord.save();
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