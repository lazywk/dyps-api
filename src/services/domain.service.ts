import prisma from "../lib/prisma.js";
import domainGenerate from "../utils/domain-generate.js";

type DomainCreated = {
    subdomain: string
    domain: string
}

export async function checkAndCreateDomain(defaultName?: string, retry = 0): Promise<DomainCreated> {
    if (retry > 5) throw new Error("Too many retries while generating domain");

    const subdomain = defaultName ? defaultName : domainGenerate();

    const project = await prisma.project.findUnique({ where: { subdomain } });

    if (project) {
        return checkAndCreateDomain(undefined, retry + 1);
    }
    return {
        subdomain,
        domain: `${subdomain}.dyps.uz`,
    }
}
