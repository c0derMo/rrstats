import { Schema, Document, Model, model } from 'mongoose';
import { ParserConfigOverrides } from "../gDriveIntegration";

interface IRRCompetitionPlacement {
    playerId: string;
    bracket: string;
    placement: number;
}

export interface IRRCompetition {
    name: string;           // Full name, eg. Roulette Rivals World Championship 2021
    tag: string;            // Tag, eg. RRWC2021    tag is also id at the same time
    challongeURL: string;
    hitmapsStatsURL: string;
    placements: IRRCompetitionPlacement[];
    updateWithSheet: boolean;
    sheetId: string;
    gid: string;
    officialCompetition: boolean;
    sortingIndex: number;
    parserOptions: ParserConfigOverrides;
}

export interface ICompetitionDocument extends IRRCompetition, Document {

}

// eslint-disable-next-line
interface ICompetitionModel extends Model<ICompetitionDocument> {
    
}

const RRCompetitionSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    tag: {
        type: String,
        required: true
    },
    challongeURL: {
        type: String
    },
    hitmapsStatsURL: {
        type: String
    },
    placements: {
        type: [{
            playerId: {
                type: String,
                required: true
            }, bracket: {
                type: String
            }, placement: {
                type: Number,
                required: true
            }}]
    },
    updateWithSheet: {
        type: Boolean,
        required: true
    },
    sheetId: {
        type: String
    },
    gid: {
        type: String
    },
    officialCompetition: {
        type: Boolean,
        required: true
    },
    sortingIndex: {
        type: Number,
        required: true
    },
    parserOptions: {
        type: Object
    }
});

export const RRCompetitionModel = model<ICompetitionDocument>("competition", RRCompetitionSchema) as ICompetitionModel;
