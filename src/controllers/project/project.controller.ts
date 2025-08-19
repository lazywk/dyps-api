

import type { Request, Response } from 'express';
import prisma from '../../lib/prisma.js';
import { checkAndCreateDomain } from '../../services/domain.service.js';
import { deployRepo } from '../../services/deploy.service.js';
import axios from 'axios';
import fs from "fs";

export async function getProjects(req: Request, res: Response) {
    try {
        const projects = await prisma.project.findMany({
            where: { owner_id: req.user.id },
            select: {
                id: true,
                domain: true,
                subdomain: true,
                created_at: true,
                default_branch: true,
                _count: {
                    select: { deployments: true },
                },
            },
            orderBy: { created_at: "desc" },
        });

        return res.json(projects.map(p => ({
            ...p,
            _count: undefined,
            deployments: p._count.deployments,
        }))
        );
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            msg: "Failed to fetch projects",
            error: (err as Error).message,
        });
    }
}

export async function createProject(req: Request, res: Response) {
    try {
        const domainData = await checkAndCreateDomain();

        const repo = await axios.get(`https://api.github.com/repositories/${req.body.repo}`, {
            headers: {
                Authorization: `token ${req.github_token}`
            }
        })

        const project = await prisma.project.create({
            data: {
                domain: domainData.domain,
                subdomain: domainData.subdomain,
                owner_id: req.user.id,
                github_id: repo.data.id
            },
        });

        const deployment = await prisma.deployment.create({
            data: {
                status: "start",
                project_id: project.id,
                user_id: req.user.id,
            }
        })

        deployRepo(repo.data.clone_url, domainData.subdomain, req.user.github_token, deployment.id);

        return res.json(project);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            msg: "Deploy error",
            error: (err as Error).message,
        });
    }
}

export async function getProjectDetail(req: Request, res: Response) {
    if (!req.params.id) {
        return res.status(400).json({ message: "Project id not provided" })
    }
    try {
        const project = await prisma.project.findUnique({
            where: { id: Number(req.params.id) },
            select: {
                id: true,
                domain: true,
                subdomain: true,
                created_at: true,
                default_branch: true,
                deployments: true
            },
        });

        return res.status(200).json({
            ...project,
            deployments: undefined,
            deployments_list: project?.deployments
        })
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            msg: "Failed to fetch projects",
            error: (err as Error).message,
        });
    }
}

export async function handleDeploy(req: Request, res: Response) {
    try {
        if (!req.user?.github_token) {
            return res.status(401).json({ msg: "GitHub token not found" });
        }

        await deployRepo(req.body.url, "test", req.user.github_token, 1);

        return res.json({ msg: "✅ Deploy started" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "Deploy error", error: (err as Error).message });
    }
}


export async function deleteProject(req: Request, res: Response) {
    const id = Number(req.params?.id)
    if (!id) {
        return res.status(400).json({ message: "Project id not provided" })
    }
    try {
        const project = await prisma.project.findUnique({
            where: { id },
            select: {
                id: true,
                subdomain: true,
            },
        });
        if (project) {
            await prisma.deployment.deleteMany({ where: { project_id: project.id } })
            await prisma.project.delete({ where: { id } })

            const deployDir = `/var/www/${project.subdomain}`;

            if (fs.existsSync(deployDir)) {
                fs.rmSync(deployDir, { recursive: true, force: true });
            } else {
                res.status(400).json("Project not found")
            }

            res.status(200).json({ id: project.id, message: "success!" })
        } else {
            res.status(400).json("Project not found")
        }

    } catch (err) {
        return res.status(500).json({
            msg: "Failed to delete",
            error: (err as Error).message,
        });
    }
}
