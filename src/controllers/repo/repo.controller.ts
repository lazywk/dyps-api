import axios from 'axios';
import type { Response, Request } from 'express';
import type { Repo } from '../../types/repo.js';

export async function getRepos(req: Request, res: Response) {
    const q = new URLSearchParams({
        visibility: "all",
        sort: "created",
        affiliation: "owner,organization_member",
    }).toString();

    const reposRes = await axios.get<Repo[]>(
        `https://api.github.com/user/repos?${q}`,
        {
            headers: { Authorization: `token ${req.github_token}` },
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
    const repo = await axios.get(`https://api.github.com/repositories/${req.params.id}`, {
        headers: {
            Authorization: `token ${req.github_token}`
        }
    })

    res.json(repo.data)
}