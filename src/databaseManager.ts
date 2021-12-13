import * as Mongoose from 'mongoose';
import { RRCompetitionModel } from './models/Competitions';
import { RRPlayerModel } from './models/Player';
import { RRMatchModel } from './models/Match';
import { RRRecordModel } from './models/Record';

let database: Mongoose.Connection;

export const connect = async() => {
    const URI = "***REMOVED***";
    if (database) return;
    await Mongoose.connect(URI, {
        autoIndex: true,
        autoCreate: true
    });
    database = Mongoose.connection;
    return {
        RRCompetitionModel,
        RRPlayerModel,
        RRMatchModel,
        RRRecordModel
    }
}

export const disconnect = () => {
    if (!database) return;
    Mongoose.disconnect();
}