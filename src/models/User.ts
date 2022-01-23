import { Schema, Document, Model, model } from 'mongoose'
import { hash, compare } from 'bcrypt';

const saltRounds = 10;


export interface IRRUser {
    name: string;
    passwordHash: string;
    type: string;
}

interface IUserDocument extends IRRUser, Document {
    setPassword(this: IUserDocument, newPassword: string): Promise<void>;
    verifyPassword(this: IUserDocument, password: string): Promise<boolean>;
}

// eslint-disable-next-line
interface IUserModel extends Model<IUserDocument> {

}

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    }
});

UserSchema.methods.setPassword = setPassword;
UserSchema.methods.verifyPassword = verifyPassword;

async function setPassword(this: IUserDocument, newPassword: string): Promise<void> {
    this.passwordHash = await hash(newPassword, saltRounds);
}

async function verifyPassword(this: IUserDocument, password: string): Promise<boolean> {
    return await compare(password, this.passwordHash);
}

export const UserModel = model<IUserDocument>("user", UserSchema) as IUserModel;
