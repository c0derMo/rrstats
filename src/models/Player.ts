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
    fillDefault(this: IPlayerDocument): Promise<void>;
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

RRPlayerSchema.methods.fillDefault = fillDefault;

async function fillDefault(this: IPlayerDocument): Promise<void> {
    this.name = "";
    this.discordId = "";
    this.title = "";
    this.customTitle = false;
    this.excludedFromSearch = false;
    this.abbreviationOverride = "";
}

export const RRPlayerModel = model<IPlayerDocument>("player", RRPlayerSchema) as IPlayerModel;