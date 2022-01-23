import * as Mongoose from 'mongoose';
import { RRCompetitionModel } from './models/Competitions';
import { RRPlayerModel } from './models/Player';
import { RRMatchModel } from './models/Match';
import { RRRecordModel } from './models/Record';
import { UserModel } from './models/User';
import { config } from 'dotenv';
config();

let database: Mongoose.Connection;

export async function connect() {
    const URI = process.env.MONGODB_URI;
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
        RRRecordModel,
        UserModel
    }
}

export function disconnect() {
    if (!database) return;
    void Mongoose.disconnect();
}
