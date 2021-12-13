import { Schema, Document, Model, model } from "mongoose";

export interface IRRRecord {
    category: string;
    isMapRecord: boolean;
    player: string;
    match: string;
    spin: string;
    time: number;
}

interface IRecordDocument extends IRRRecord, Document {

}

interface IRecordModel extends Model<IRecordDocument> {

}

const RRRecordSchema = new Schema({
    category: String,
    isMapRecord: Boolean,
    player: String,
    match: String,
    spin: String,
    time: Number
});

export const RRRecordModel = model<IRecordDocument>("record", RRRecordSchema);