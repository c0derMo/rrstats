import { Schema, Document, Model, model } from 'mongoose';

interface IRRCompetitionPlacement {
    playerId: string;
    bracket: string;
    placement: number;
}

interface IRRCompetiton {
    name: string;           // Full name, eg. Roulette Rivals World Championship 2021
    tag: string;            // Tag, eg. RRWC2021    tag is also id at the same time
    started: Date;
    finished: Date;
    challongeURL: string;
    hitmapsStatsURL: string;
    placements: IRRCompetitionPlacement[];
    updateWithSheet: boolean;
    sheetId: string;
    tabName: string;
    officialCompetition: boolean;
}

interface ICompetitionDocument extends IRRCompetiton, Document {

}

interface ICompetitionModel extends Model<ICompetitionDocument> {
    
}

const RRCompetitionSchema = new Schema({
    name: String,
    tag: String,
    started: Date,
    finished: Date,
    challongeURL: String,
    hitmapsStatsURL: String,
    placements: [{playerId: String, bracket: String, placement: Number}],
    updateWithSheet: Boolean,
    sheetId: String,
    tabName: String,
    officialCompetition: Boolean
});

export const RRCompetitionModel = model<ICompetitionDocument>("competition", RRCompetitionSchema) as ICompetitionModel;