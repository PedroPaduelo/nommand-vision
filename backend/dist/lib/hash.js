import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
const SALT_ROUNDS = 12;
export async function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
}
export async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}
export function hashToken(token) {
    return createHash('sha256').update(token).digest('hex');
}
