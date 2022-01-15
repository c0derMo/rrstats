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
    player1: string;
    player2: string;
    score: IRRMatchScore;
    competition: string;
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
    player1: {
        type: String,
        required: true
    },
    player2: {
        type: String,
        required: true
    },
    score: {
        type: {
            player1Points: {
                type: Number,
                required: true
            }, player2Points: {
                type: Number,
                required: true
            }, winner: {
                type: Number,
                required: true
            } },
        required: true
    },
    competition: {
        type: String,
        required: true
    },
    platform: {
        type: String
    },
    round: {
        type: String,
        required: true
    },
    maps: {
        type: [{
            map: {
                type: String,
                required: true
            }, winner: {
                type: Number,
                required: true
            }, pickedBy: {
                type: Number,
                required: true
            }
        }]
    },
    bans: {
        type: [{
            map: {
                type: String,
                required: true
            }, bannedBy: {
                type: Number,
                required: true
            }
        }]
    },
    timestamp: {
        type: Date,
        required: true
    }
});

export const RRMatchModel = model<IMatchDocument>("match", RRMatchSchema) as IMatchModel;