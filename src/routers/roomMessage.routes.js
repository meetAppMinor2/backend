import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    getRoomMessages, 
    sendRoomMessage, 
    getOrganizationMessages, 
    sendOrganizationMessage, 
    deleteMessage 
} from "../controllers/roomMessage.controller.js";

const router = Router();

// Room-based messages (instant meetings)
router.route("/room/:roomId").get(verifyJWT, getRoomMessages);
router.route("/room/:roomId/send").post(verifyJWT, sendRoomMessage);

// Organization messages (persistent)
router.route("/organization/:organizationId").get(verifyJWT, getOrganizationMessages);
router.route("/organization/:organizationId/send").post(verifyJWT, sendOrganizationMessage);

// Class messages (persistent)
router.route("/class/:classId").get(verifyJWT, getOrganizationMessages);
router.route("/class/:classId/send").post(verifyJWT, sendOrganizationMessage);

// Delete message
router.route("/message/:messageId").delete(verifyJWT, deleteMessage);

export default router;
