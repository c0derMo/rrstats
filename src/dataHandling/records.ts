import { RRPlayerModel } from "../models/Player";
import { IRRRecord, RRRecordModel } from "../models/Record";

export async function getRecords(): Promise<IRRRecord[]> {
    let records = await RRRecordModel.find({}).exec();
    for(let record of records) {
        for(let player in record.players) {
            try {
                let playerObject = await RRPlayerModel.findById(record.players[player]).exec();
                record.players[player] = playerObject.primaryName;
            } catch(e) {}
        }
    }
    return records;
}