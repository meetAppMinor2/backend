import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getMessages, sendMessage } from "../controllers/message.controller.js";

const router = Router();

// Get all messages for a class
router.route("/:classId").get(verifyJWT, getMessages);

// Send a message in a class
router.route("/:classId/send").post(verifyJWT, sendMessage);
// router.route("/roomId=${roomId}").get(verifyJWT, getMessages); // Get all messages for a specific room

export default router;