import { Router } from "express";
import { getAllOrganizations, createOrganization, deleteOrganization} from "../controllers/organisation.controller.js";
import { verifyJWT } from '../middlewares/auth.middleware.js'; 
import {createClass , getClassesByOrganization, deleteClass} from "../controllers/class.controller.js"; // Importing the class controller    
import { inviteUser } from "../controllers/invite.controller.js"; // Importing the invite controller
import { getMessages, sendMessage } from "../controllers/message.controller.js";

const router = Router();

router.route("/getOrganizations").post(getAllOrganizations); //route for getting all the organizations 
router.route("/createOrganization").post(verifyJWT, createOrganization); //route for creating a new organization
router.route("/:organizationId/createClass").post(verifyJWT, createClass); 
router.route("/:organizationId/classes").get(verifyJWT, getClassesByOrganization); 
router.route("/deleteOrganisation/:organizationId").delete(verifyJWT, deleteOrganization); // Get all classes under an organization
router.route("/:organizationId/deleteClass/:classId").delete(verifyJWT, deleteClass); // Delete
router.route("/:organizationId/classes/:classId/messages").get(verifyJWT, getMessages); // Get all messages under a class
router.route("/:organizationId/classes/:classId/sendmessage").post(verifyJWT, sendMessage); // Send a message to a class
router.route("/:organizationId/classes/:classId/invite").post(verifyJWT, inviteUser); // Invite a user to a class
// router.route("/:organizationId/classes/:classId/members").get(verifyJWT, getClassMembers); // Get all members of a class
export default router;