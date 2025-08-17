import prisma from "../lib/prisma.js";
import domainGenerate from "../utils/domain-generate.js";

type DomainCreated = {
    subdomain: string
    domain: string
}

export async function checkAndCreateDomain(retry = 0): Promise<DomainCreated> {
    if (retry > 5) throw new Error("Too many retries while generating domain");

    const subdomain = domainGenerate(); // faqat subdomain: "abc123"
    const domain = `${subdomain}.example.com`;

    const project = await prisma.project.findUnique({ where: { domain } });

    if (project) {
        return checkAndCreateDomain(retry + 1);
    }
    return {
        subdomain,
        domain,
    }
}
