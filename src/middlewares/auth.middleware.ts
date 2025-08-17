import type { NextFunction, Request, Response } from "express";
import { decodeToken } from "../utils/auth.js";
import prisma from "../lib/prisma.js";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization
    if (token) {
        const userCredentials = decodeToken(token);
        const nowSec = Math.floor(Date.now() / 1000);

        if (userCredentials.exp > nowSec) {
            const user = await prisma.user.findUnique({
                where: {
                    github_id: userCredentials.id,
                },
            });

            req.user! = user!;
            req.github_token = user?.github_token!;
            req.token = token

            next();
        } else {
            res.status(401).json({ message: "Token expired" });
        }
    } else {
        res.status(401).json({ message: "No token provided" });
    }
}
