import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';
import { nanoid } from 'nanoid';

export default function domainGenerate(): string {
    const namePart = uniqueNamesGenerator({ dictionaries: [adjectives, animals], separator: '-' });
    const randomPart = nanoid(4);
    const subdomain = `${namePart}-${randomPart}`;

    return subdomain
}