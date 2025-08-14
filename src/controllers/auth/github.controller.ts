import type { Request, Response } from 'express';
import axios from 'axios';
import prisma from '../../lib/prisma.js';
import { signToken } from '../../utils/auth.js';

const CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GITHUB_REDIRECT_URI!;

export async function github(req: Request, res: Response) {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
    )}&scope=repo,user:email,read:org`;
    res.redirect(githubAuthUrl);
}

export async function githubCallBack(req: Request, res: Response) {
    const code = req.query.code as string;
    if (!code) return res.status(400).send("Code is missing");

    const tokenRes = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code,
            redirect_uri: REDIRECT_URI,
        },
        {
            headers: { Accept: "application/json" },
        }
    );

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) return res.status(401).json({ msg: "No github access token" })

    const userRes = await axios.get("https://api.github.com/user", {
        headers: { Authorization: `token ${accessToken}` },
    });

    const emailsRes = await axios.get("https://api.github.com/user/emails", {
        headers: { Authorization: `token ${accessToken}` },
    });

    const primaryEmail = emailsRes.data.find((e: any) => e.primary)?.email;

    const githubUser = userRes.data;

    const user = await prisma.user.upsert({
        where: { github_id: githubUser.id },
        update: {
            github_login: githubUser.login,
            github_avatar: githubUser.avatar_url,
            email: primaryEmail,
            github_token: accessToken,
        },
        create: {
            company_name: githubUser.login,
            github_id: githubUser.id,
            github_login: githubUser.login,
            github_avatar: githubUser.avatar_url,
            github_token: accessToken,
            email: primaryEmail,
        },
    });

    const jwtToken = signToken({ id: user.github_id })

    res.json({
        message: "GitHub login successful",
        user,
        access_token: jwtToken,
    });
}
