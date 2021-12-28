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
    name: String,
    tag: String,
    challongeURL: String,
    hitmapsStatsURL: String,
    placements: [{playerId: String, bracket: String, placement: Number}],
    updateWithSheet: Boolean,
    sheetId: String,
    tabName: String,
    officialCompetition: Boolean,
    sortingIndex: Number
});

export const RRCompetitionModel = model<ICompetitionDocument>("competition", RRCompetitionSchema) as ICompetitionModel;