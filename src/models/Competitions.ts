import { Schema, Document, Model, model } from 'mongoose';

interface IRRCompetiton {
    name: string;           // Full name, eg. Roulette Rivals World Championship 2021
    tag: string;            // Tag, eg. RRWC2021    tag is also id at the same time
    started: Date;
    finished: Date;
    challongeURL: string;
    hitmapsStatsURL: string;
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
    hitmapsStatsURL: String
});

export const RRCompetitionModel = model<ICompetitionDocument>("competition", RRCompetitionSchema) as ICompetitionModel;