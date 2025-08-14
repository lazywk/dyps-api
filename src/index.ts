import express from "express";
import cors from "cors"
import authRoutes from "./routes/auth.routes.js";
import dotenv from 'dotenv';
import repoRoutes from "./routes/repo.routes.js";
import prisma from "./lib/prisma.js";

const app = express();
const router = express.Router()

dotenv.config();

app.use(express.json());

app.use(cors({
    origin: ['http://localhost:3002']
}))

// app.use('/api/v1', router)
app.use(router)
router.use('/auth', authRoutes)
router.use('/gh', repoRoutes)

app.get('/users', async (req, res) => {
    const users = await prisma.user.findMany() 
    res.json(users)
})

app.listen(3000, () => {
    console.log('server is running on port 3000');
})