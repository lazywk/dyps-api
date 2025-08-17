import { Router } from "express";
import { createProject, getProjectDetail, getProjects } from "../controllers/project/project.controller.js";

const router = Router()

router.get('/', getProjects)
router.post('/', createProject)
router.get('/:id', getProjectDetail)

const projectRoutes = router
export default projectRoutes