import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET!;
const expiresIn = process.env.JWT_EXPIRES_IN!;

export function signToken(payload: object) {
    return jwt.sign(payload, jwtSecret, { expiresIn: expiresIn } as any);
}

export function decodeToken(token: string) {
    return jwt.decode(token) as { id: number }
}
