import axios from 'axios';
import type { Request, Response } from 'express';
import type { Repo } from '../../types/repo.js';
import prisma from '../../lib/prisma.js';
import { decodeToken } from '../../utils/auth.js';

export async function getRepos(req: Request, res: Response) {
    const accessToken = req.headers.authorization
    if (!accessToken) return res.status(401).json({ msg: "Missing token" })

    const q = new URLSearchParams({
        visibility: "all",
        sort: "created",
        affiliation: "owner,organization_member",
    }).toString();

    const user = await prisma.user.findUnique({ where: { github_id: decodeToken(accessToken).id } })

    const reposRes = await axios.get<Repo[]>(
        `https://api.github.com/user/repos?${q}`,
        {
            headers: { Authorization: `token ${user?.github_token}` },
        }
    );

    const result = reposRes.data?.map(rp => ({
        id: rp.id,
        node_id: rp.node_id,
        name: rp.name,
        private: rp.private,
        description: rp.description,
        created_at: rp.created_at,
        updated_at: rp.updated_at,
        pushed_at: rp.pushed_at,
        clone_url: rp.clone_url,
        default_branch: rp.default_branch,
    }))

    res.json(result);
}

export async function getRepoDetail(req: Request, res: Response) {
    console.log(req.params.id);

    res.json({ message: "hello" })
}