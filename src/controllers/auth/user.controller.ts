import type { Request, Response } from 'express';
import prisma from '../../lib/prisma.js';
import { decodeToken } from '../../utils/auth.js';

export async function getMe(req: Request, res: Response) {
    const accessToken = req.headers.authorization as string;
    if (!accessToken) return res.status(401).json({ msg: "Missing token" })

    const user = await prisma.user.findUnique({ where: { github_id: decodeToken(accessToken).id } })

    if (!user) {
        res.status(401).json({ msg: "User not found or token is invalid" })
    }

    res.json({
        ...user,
        github_token: undefined
    });
}
