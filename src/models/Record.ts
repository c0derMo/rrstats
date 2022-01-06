import { Schema, Document, Model, model } from "mongoose";

export interface IRRRecord {
    category: string;
    isMapRecord: boolean;
    players: string[];
    match: string;
    details: string;
    time: number;
    videoLink: string;
    sortingIndex: number;
}

interface IRecordDocument extends IRRRecord, Document {

}

interface IRecordModel extends Model<IRecordDocument> {

}

const RRRecordSchema = new Schema({
    category: {
        type: String,
        required: true
    },
    isMapRecord: {
        type: Boolean,
        required: true
    },
    players: {
        type: [String],
        required: true
    },
    match: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    time: {
        type: Number,
        required: true
    },
    videoLink: {
        type: String,
        required: true
    },
    sortingIndex: {
        type: Number,
        required: true
    }
});

export const RRRecordModel = model<IRecordDocument>("record", RRRecordSchema) as IRecordModel;