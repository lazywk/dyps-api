import type { Request, Response } from 'express';
import prisma from '../../lib/prisma.js';
import { decodeToken } from '../../utils/auth.js';
import { deployRepo } from '../../services/deploy.service.js';

export async function handleDeploy(req: Request, res: Response) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ msg: "Missing token" });
        }

        const token = authHeader

        const decoded = decodeToken(token) as { id: number };
        if (!decoded?.id) {
            return res.status(401).json({ msg: "Invalid token" });
        }

        const user = await prisma.user.findUnique({
            where: { github_id: decoded.id },
        });

        if (!user?.github_token) {
            return res.status(401).json({ msg: "GitHub token not found" });
        }

        await deployRepo(req.body.url, "test", user.github_token);

        return res.json({ msg: "✅ Deploy started" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "Deploy error", error: (err as Error).message });
    }
}
