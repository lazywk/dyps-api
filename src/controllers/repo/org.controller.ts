import axios from 'axios';
import type { Request, Response } from 'express';
import prisma from '../../lib/prisma.js';
import { decodeToken } from '../../utils/auth.js';

export async function getOrganizations(req: Request, res: Response) {
    const accessToken = req.headers.authorization
    if (!accessToken) return res.status(401).json({ msg: "Missing token" })

    const user = await prisma.user.findUnique({ where: { github_id: decodeToken(accessToken).id } })

    const orgsResp = await axios.get(
        `https://api.github.com/user/orgs`,
        {
            headers: { Authorization: `token ${user?.github_token}` },
        }
    );

    res.json(orgsResp.data);
}
