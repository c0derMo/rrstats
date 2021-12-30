import { Schema, Document, Model, model } from 'mongoose'

export interface IAuditLogEntry {
    user: string;
    action: string;
    timestamp: Date;
    details: object;
}

interface IAuditLogEntryDocument extends IAuditLogEntry, Document {
    
}

interface IAuditLogEntryModel extends Model<IAuditLogEntryDocument> {
    newEntry(username: string, message: string, details?: object): Promise<void>
}

const AuditLogEntrySchema = new Schema({
    user: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    },
    details: {
        type: Object,
        required: true
    }
});

AuditLogEntrySchema.statics.newEntry = newEntry;

async function newEntry(username: string, message: string, details: object={}): Promise<void> {
    await AuditLogModel.create({
        user: username,
        action: message,
        timestamp: new Date(),
        details: details
    });
}

export const AuditLogModel = model<IAuditLogEntryDocument>("auditlog", AuditLogEntrySchema) as IAuditLogEntryModel;