import { Schema, Document, Model, model } from 'mongoose';

interface IRRCompetitionPlacement {
    competition: string;
    placement: number;
    bracket: string;
}

interface IRRPlayer {
    primaryName: string;        // Name the player is currently accessible by URL and is displayed on the page
    secondaryNames: string[];   // Other names the player has played as in the past
    discordId: string;
    competitions: IRRCompetitionPlacement[];
    title: string;
    customTitle: boolean;
}

interface IPlayerDocument extends IRRPlayer, Document {

}

interface IPlayerModel extends Model<IPlayerDocument> {

}

const RRPlayerSchema = new Schema({
    primaryName: String,
    secondaryName: String,
    discordId: String,
    competitions: [{ competiton: String, placement: Number, bracket: String }],
    title: String,
    customTitle: Boolean
});

export const RRPlayerModel = model<IPlayerDocument>("player", RRPlayerSchema) as IPlayerModel;