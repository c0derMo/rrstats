import { RRPlayerModel } from "../models/Player";
import {IRecordDocument, IRRRecord, RRRecordModel} from "../models/Record";
import {AuditLogModel} from "../models/AuditLogEntry";
import {jsonDiff} from "../utils";
import { Types } from "mongoose";

export async function getRecords(filter?: string): Promise<IRRRecord[]> {
    let filterObj = {};
    if(filter) {
        filterObj = { category: filter };
    }
    const records = await RRRecordModel.find(filterObj).sort("sortingIndex").exec();
    for(const record of records) {
        for(let player = 0; player < record.players.length; player++) {
            try {
                const playerObject = await RRPlayerModel.findById(record.players[player]).exec();
                if(playerObject !== null) {
                    record.players[player] = playerObject.name;
                }
            } catch {} // eslint-disable-line
        }
    }
    return records;
}

export async function getStoredRecords(): Promise<IRRRecord[]> {
    return await RRRecordModel.find({}).sort("sortingIndex").exec();
}

export async function editRecord(record: IRecordDocument, username: string): Promise<boolean> {
    const dbRecord = await RRRecordModel.findOne({_id: (record._id as Types.ObjectId).toString() }).exec();
    if(dbRecord == null) return false;
    Object.assign(dbRecord, record);
    await dbRecord.save();
    await AuditLogModel.newEntry(username, "Edited record " + (dbRecord._id as Types.ObjectId).toString(), jsonDiff(dbRecord, record));
    return true;
}

export async function addRecord(record: IRecordDocument, username: string): Promise<boolean> {
    delete record._id;
    await RRRecordModel.create(record);
    await AuditLogModel.newEntry(username, "Added record", {recordData: record});
    return true;
}

export async function deleteRecord(record: IRecordDocument, username: string): Promise<boolean> {
    await RRRecordModel.findByIdAndDelete(record._id).exec();
    await AuditLogModel.newEntry(username, "Deleted record " + (record._id as Types.ObjectId).toString(), {recordData: record});
    return true;
}
