import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { detectPackageManager } from "../lib/find-package-manager.js";
import prisma from "../lib/prisma.js";

export async function deployRepo(repoUrl: string, subdomain: string, accessToken: string, deploymentId: number) {
    const currentDir = process.cwd(); // Node.js appning joriy working dir
    const repoDir = path.join(currentDir, subdomain);
    // const deployDir = `/var/www/${subdomain}`;
    const deployDir = path.join(currentDir, subdomain + '-build');

    // Helper: run command with live logs
    function runCommand(cmd: string, args: string[], cwd: string) {
        return new Promise<void>((resolve, reject) => {
            const child = spawn(cmd, args, { cwd, shell: true });

            child.stdout.on("data", data => {
                process.stdout.write(data); // real-time log
            });

            child.stderr.on("data", data => {
                process.stderr.write(data); // real-time error log
            });

            child.on("close", code => {
                if (code === 0) resolve();
                else reject(new Error(`${cmd} ${args.join(" ")} failed with code ${code}`));
            });
        });
    }

    try {
        console.log(`📥 Cloning ${repoUrl}...`);
        const cloneUrl = repoUrl.replace(
            "https://github.com/",
            `https://x-access-token:${accessToken}@github.com/`
        );

        if (fs.existsSync(repoDir)) {
            fs.rmSync(repoDir, { recursive: true, force: true });
        }

        await updateDeplyomentStatus(deploymentId, "cloning")
        await runCommand("git", ["clone", cloneUrl, repoDir], currentDir);

        const pkgManager = detectPackageManager(repoDir);

        console.log(`📦 Installing dependencies in ${repoDir}...`);
        await updateDeplyomentStatus(deploymentId, "installing")
        await runCommand(pkgManager, ["install"], repoDir); // universal install

        console.log("🏗 Building project...");
        await updateDeplyomentStatus(deploymentId, "building")
        await runCommand(pkgManager, ["run", "build"], repoDir);

        console.log("📂 Deploying build folder...");
        await updateDeplyomentStatus(deploymentId, "deploying")
        const buildPath = fs.existsSync(path.join(repoDir, "dist"))
            ? path.join(repoDir, "dist")
            : path.join(repoDir, "build");

        if (!fs.existsSync(buildPath)) {
            throw new Error("Build folder not found (dist/build missing)");
        }

        // Deploy dir clean & copy
        if (fs.existsSync(deployDir)) {
            fs.rmSync(deployDir, { recursive: true, force: true });
        }
        fs.mkdirSync(deployDir, { recursive: true });

        fs.cpSync(buildPath, deployDir, { recursive: true });

        await updateDeplyomentStatus(deploymentId, "ready")
        console.log(`✅ Deployed to ${deployDir}`);
    } catch (err) {
        console.error("❌ Deploy error:", err);
        await updateDeplyomentStatus(deploymentId, "failed")
        throw err;
    } finally {
        // Clean up cloned repo
        if (fs.existsSync(repoDir)) {
            fs.rmSync(repoDir, { recursive: true, force: true });
            console.log("🗑 Repo folder removed.");
        }
    }
}

async function updateDeplyomentStatus(id: number, status: string) {
    await prisma.deployment.update({ where: { id }, data: { status } })
}