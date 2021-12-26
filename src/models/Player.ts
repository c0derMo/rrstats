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
    name: String,
    discordId: String,
    title: String,
    customTitle: Boolean,
    excludedFromSearch: Boolean,
    abbreviationOverride: String
});

export const RRPlayerModel = model<IPlayerDocument>("player", RRPlayerSchema) as IPlayerModel;