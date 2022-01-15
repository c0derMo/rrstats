import { Schema, Document, Model, model } from 'mongoose'

export interface IRRPlayer {
    name: string;
    discordId: string;
    title: string;
    customTitle: boolean;
    excludedFromSearch: boolean;
    abbreviationOverride: string;
}

interface IPlayerDocument extends IRRPlayer, Document {
    
}

interface IPlayerModel extends Model<IPlayerDocument> {

}

const RRPlayerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    discordId: {
        type: String
    },
    title: {
        type: String
    },
    customTitle: {
        type: Boolean,
        required: true
    },
    excludedFromSearch: {
        type: Boolean,
        required: true
    },
    abbreviationOverride: {
        type: String
    }
});

export const RRPlayerModel = model<IPlayerDocument>("player", RRPlayerSchema) as IPlayerModel;