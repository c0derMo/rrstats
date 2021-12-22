import { Schema, Document, Model, model } from "mongoose";

export interface IRRRecord {
    category: string;
    isMapRecord: boolean;
    players: string[];
    match: string;
    details: string;
    time: number;
    videoLink: string;
}

interface IRecordDocument extends IRRRecord, Document {

}

interface IRecordModel extends Model<IRecordDocument> {

}

const RRRecordSchema = new Schema({
    category: String,
    isMapRecord: Boolean,
    players: [String],
    match: String,
    details: String,
    time: Number,
    videoLink: String
});

export const RRRecordModel = model<IRecordDocument>("record", RRRecordSchema) as IRecordModel;