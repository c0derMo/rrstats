import "config/dotenv";
import "reflect-metadata";
import { DataSource } from 'typeorm';
import { AuditLogEntry } from './models/AuditLogEntry';
import { RRCompetiton } from "./models/Competitions";
import { RRMatch } from "./models/Match";
import { RRPlayer } from "./models/Player";
import { RRRecord } from "./models/Record";
import { RRUser } from "./models/User";

export let database: DataSource;

export async function connect(): Promise<void> {
    if (database) return;
    database = new DataSource({
        type: "sqlite",
        database: process.env.DATABASE,
        entities: [ AuditLogEntry, RRCompetiton, RRMatch, RRPlayer, RRRecord, RRUser ]
    });

    await database.initialize();
    await database.synchronize();
}

export function disconnect(): void {
    if (!database) return;
    void database.destroy();
    database = undefined;
}