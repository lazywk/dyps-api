import express from "express";
import cors from "cors"
import authRoutes from "./routes/auth.routes.js";
import dotenv from 'dotenv';
import repoRoutes from "./routes/repo.routes.js";
import prisma from "./lib/prisma.js";
import projectRoutes from "./routes/project.routes.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";

const port = process.env.APP_PORT!;

const app = express();
const router = express.Router()

dotenv.config();

app.use(express.json());

app.use(cors({
    origin: ['http://localhost:3002', 'https://reactgo.uz']
}))

// app.use('/api/v1', router)
app.use(router)

router.use('/auth', authRoutes)

router.use(authMiddleware)

router.use('/gh', repoRoutes)
router.use('/projects', projectRoutes)

app.get('/users', async (req, res) => {
    const users = await prisma.deployment.findMany({ where: { user_id: 1 } })
    res.json(users)
})

app.listen(port ?? 3000, () => {
    console.log(`server is running on port ${port}`);
})