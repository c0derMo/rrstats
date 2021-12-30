import { Schema, Document, Model, model } from 'mongoose';

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
    tabName: string;
    officialCompetition: boolean;
    sortingIndex: number;
}

interface ICompetitionDocument extends IRRCompetition, Document {

}

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
        type: String,
        required: true
    },
    hitmapsStatsURL: {
        type: String,
        required: true
    },
    placements: {
        type: [{
            playerId: {
                type: String,
                required: true
            }, bracket: {
                type: String,
                required: true
            }, placement: {
                type: Number,
                required: true
            }}],
        required: true
    },
    updateWithSheet: {
        type: Boolean,
        required: true
    },
    sheetId: {
        type: String,
        required: true
    },
    tabName: {
        type: String,
        required: true
    },
    officialCompetition: {
        type: Boolean,
        required: true
    },
    sortingIndex: {
        type: Number,
        required: true
    }
});

export const RRCompetitionModel = model<ICompetitionDocument>("competition", RRCompetitionSchema) as ICompetitionModel;