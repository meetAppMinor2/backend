import { Router } from "express";
import { getAllOrganizations, createOrganization} from "../controllers/organisation.controller.js";
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route("/getOrganizations").post(getAllOrganizations); //route for getting all the organizations 
router.route("/createOrganization").post(verifyJWT, createOrganization); //route for creating a new organization

export default router;