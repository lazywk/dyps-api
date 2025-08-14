import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export async function deployRepo(repoUrl: string, subdomain: string, accessToken: string) {
    const currentDir = process.cwd(); // Node.js appning joriy working dir
    const repoDir = path.join(currentDir, subdomain);
    // const deployDir = `/var/www/${subdomain}`;
    const deployDir =path.join(currentDir, subdomain + '-build');

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

        await runCommand("git", ["clone", cloneUrl, repoDir], currentDir);

        console.log(`📦 Installing dependencies in ${repoDir}...`);
        await runCommand("pnpm", ["install"], repoDir); // universal install

        console.log("🏗 Building project...");
        await runCommand("pnpm", ["run", "build"], repoDir);

        console.log("📂 Deploying build folder...");
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

        console.log(`✅ Deployed to ${deployDir}`);
    } catch (err) {
        console.error("❌ Deploy error:", err);
        throw err;
    } finally {
        // Clean up cloned repo
        if (fs.existsSync(repoDir)) {
            fs.rmSync(repoDir, { recursive: true, force: true });
            console.log("🗑 Repo folder removed.");
        }
    }
}


// import { execSync } from "child_process";
// import path from "path";
// import fs from "fs";
// import os from "os";

// export async function deployRepo(repoUrl: string, subdomain: string, accessToken: string) {
//     const tmpDir = path.join(os.tmpdir(), subdomain);
//     const wwwDir = path.join(process.cwd(), "local-www", subdomain);

//     try {
//         console.log("📥 Cloning repo...");
//         const cloneUrl = repoUrl.replace(
//             "https://github.com/",
//             `https://x-access-token:${accessToken}@github.com/`
//         );
//         execSync(`git clone ${cloneUrl} ${tmpDir}`, { stdio: "inherit" });

//         console.log("📦 Installing dependencies...");
//         execSync(`npm install`, { cwd: tmpDir, stdio: "inherit" });

//         console.log("🏗 Building project...");
//         execSync(`npm run build`, { cwd: tmpDir, stdio: "inherit" });

//         console.log("🗑 Clearing old build...");
//         if (fs.existsSync(wwwDir)) {
//             fs.rmSync(wwwDir, { recursive: true, force: true });
//         }

//         console.log("📂 Copying new build...");
//         const buildPath = path.join(tmpDir, "dist"); // yoki build
//         fs.mkdirSync(wwwDir, { recursive: true });
//         fs.cpSync(buildPath, wwwDir, { recursive: true });

//         console.log(`✅ Deployed to ${wwwDir}`);
//     } catch (err) {
//         console.error("❌ Deploy error:", err);
//     } finally {
//         fs.rmSync(tmpDir, { recursive: true, force: true });
//     }
// }
