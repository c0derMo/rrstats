import { Schema, Document, Model, model } from 'mongoose'

export interface IRRPlayer {
    name: string;
    discordId: string;
    title: string;
    customTitle: boolean;
    excludedFromSearch: boolean;
    abbreviationOverride: string;
}

export interface IPlayerDocument extends IRRPlayer, Document {

}

// eslint-disable-next-line
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
        type: Boolean
    },
    excludedFromSearch: {
        type: Boolean
    },
    abbreviationOverride: {
        type: String
    }
});

export const RRPlayerModel = model<IPlayerDocument>("player", RRPlayerSchema) as IPlayerModel;
