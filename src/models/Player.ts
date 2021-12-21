import { Schema, Document, Model, model } from 'mongoose'

export interface IRRPlayer {
    primaryName: string;        // Name the player is currently accessible by URL and is displayed on the page
    secondaryNames: string[];   // Other names the player has played as in the past
    discordId: string;
    title: string;
    customTitle: boolean;
    excludedFromSearch: boolean;
}

interface IPlayerDocument extends IRRPlayer, Document {
    fillDefault(this: IPlayerDocument): Promise<void>;
}

interface IPlayerModel extends Model<IPlayerDocument> {

}

const RRPlayerSchema = new Schema({
    primaryName: String,
    secondaryNames: [String],
    discordId: String,
    title: String,
    customTitle: Boolean,
    excludedFromSearch: Boolean
});

RRPlayerSchema.methods.fillDefault = fillDefault;

async function fillDefault(this: IPlayerDocument): Promise<void> {
    this.primaryName = "";
    this.secondaryNames = [];
    this.discordId = "";
    this.title = "";
    this.customTitle = false;
    this.excludedFromSearch = false;
}

export const RRPlayerModel = model<IPlayerDocument>("player", RRPlayerSchema) as IPlayerModel;