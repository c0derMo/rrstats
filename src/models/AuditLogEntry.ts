import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { database } from "../databaseManager";

@Entity()
export class AuditLogEntry {
    @PrimaryGeneratedColumn()
        id: number;
    @Column()
        user: string;
    @Column()
        action: string;
    @Column()
        timestamp: Date;
    @Column("simple-json")
        details: Record<string, unknown>;
}


export async function newEntry(username: string, message: string, details: Record<string | number, unknown>={}): Promise<void> {
    const entry = new AuditLogEntry();
    entry.user = username;
    entry.action = message,
    entry.timestamp = new Date();
    entry.details = details;
    await database.getRepository(AuditLogEntry).save(entry);
}