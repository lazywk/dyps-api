import { Router } from "express";
import { github, githubCallBack } from "../controllers/auth/github.controller.js";
import { getMe } from "../controllers/auth/user.controller.js";

const router = Router()

router.get('/github', github)
router.get('/github-callback', githubCallBack)
router.get('/me', getMe)

const authRoutes = router
export default authRoutes