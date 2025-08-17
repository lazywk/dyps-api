import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';
import { nanoid } from 'nanoid';

export default function domainGenerate(): string {
    const namePart = uniqueNamesGenerator({ dictionaries: [adjectives, animals], separator: '-', style: "lowerCase" });
    const randomPart = nanoid(4).toLowerCase()
    const subdomain = `${namePart}-${randomPart}`;

    return subdomain
}