import { User } from "@prisma/client";

declare global {
    namespace Express {
        interface Request {
            user: User;          // bu optional bo‘ladi
            github_token: string;
            token: string
        }
    }
}
