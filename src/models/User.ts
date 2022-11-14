import { hash, compare } from 'bcrypt';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { database } from '../databaseManager';

const saltRounds = 10;

@Entity()
export class RRUser {
    @PrimaryGeneratedColumn("uuid")
        uuid: string;
    @Column()
        name: string;
    @Column()
        passwordHash: string;
    @Column()
        type: string;
}

export async function setPassword(user: RRUser, newPassword: string): Promise<void> {
    user.passwordHash = await hash(newPassword, saltRounds);
    await database.getRepository(RRUser).save(user);
}

export async function verifyPassword(user: RRUser, password: string): Promise<boolean> {
    return await compare(password, user.passwordHash);
}