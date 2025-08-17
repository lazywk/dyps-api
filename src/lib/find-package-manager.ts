import fs from "fs";
import path from "path";

export function detectPackageManager(repoDir: string): "pnpm" | "yarn" | "npm" {
    if (fs.existsSync(path.join(repoDir, "pnpm-lock.yaml"))) {
        return "pnpm";
    }
    if (fs.existsSync(path.join(repoDir, "yarn.lock"))) {
        return "yarn";
    }
    if (fs.existsSync(path.join(repoDir, "package-lock.json"))) {
        return "npm";
    }
    return "npm"; // fallback
}
