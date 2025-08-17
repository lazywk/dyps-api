import { Router } from "express";
import { getRepoDetail, getRepos } from "../controllers/repo/repo.controller.js";
import { getOrganizations } from "../controllers/repo/org.controller.js";

const router = Router()

router.get('/repos', getRepos)
router.get('/organizations', getOrganizations)
router.get('/repos/:id', getRepoDetail)

const repoRoutes = router
export default repoRoutes