import { Router } from "express";
import { getAllOrganizations, createOrganization} from "../controllers/organisation.controller.js";
import { verifyJWT } from '../middlewares/auth.middleware.js'; 
import {createClass , getClassesByOrganization} from "../controllers/class.controller.js"; // Importing the class controller    

const router = Router();

router.route("/getOrganizations").post(getAllOrganizations); //route for getting all the organizations 
router.route("/createOrganization").post(verifyJWT, createOrganization); //route for creating a new organization
router.route("/:organizationId/createClass").post(verifyJWT, createClass); 
router.route("/:organizationId/classes").get(verifyJWT, getClassesByOrganization); 
export default router;