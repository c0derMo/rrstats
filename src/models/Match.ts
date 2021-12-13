import { Schema, Document, Model, model } from "mongoose";

interface IRRMatchScore {
    player1Points: number;
    player2Points: number;
    winner: number;
}

interface IRRBan {
    map: string;
    bannedBy: number;
}

interface IRRMap {
    map: string;
    winner: number;
    pickedBy: number;       // Picked by player number
}

export interface IRRMatch {
    player1: string;        // player id's in the future
    player2: string;        // player id's in the future
    score: IRRMatchScore;
    competition: string;    // Possibly id the comps?
    platform: string;
    round: string;
    maps: IRRMap[];
    bans: IRRBan[];
    timestamp: Date;
}

interface IMatchDocument extends IRRMatch, Document {

}

interface IMatchModel extends Model<IMatchDocument> {

}

const RRMatchSchema = new Schema({
    player1: String,
    player2: String,
    score: { player1Points: Number, player2Points: Number, winner: Number },
    competition: String,
    platform: String,
    round: String,
    maps: [{ map: String, winner: Number, pickedBy: Number }],
    bans: [{ map: String, bannedBy: Number }],
    timestamp: Date
});

export const RRMatchModel = model<IMatchDocument>("match", RRMatchSchema) as IMatchModel;