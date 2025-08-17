import axios from 'axios';
import type { Request, Response } from 'express';

export async function getOrganizations(req: Request, res: Response) {
    const orgsResp = await axios.get(
        `https://api.github.com/user/orgs`,
        {
            headers: { Authorization: `token ${req.github_token}` },
        }
    );

    res.json(orgsResp.data);
}
