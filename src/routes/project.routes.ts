import { Router } from "express";
import { createProject, deleteProject, getProjectDetail, getProjects } from "../controllers/project/project.controller.js";

const router = Router()

router.get('/', getProjects)
router.post('/', createProject)
router.get('/:id', getProjectDetail)
router.delete('/:id', deleteProject)

const projectRoutes = router
export default projectRoutes