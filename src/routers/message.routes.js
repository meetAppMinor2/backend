import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getMessages, sendMessage } from "../controllers/message.controller.js";

const router = Router();

// Get all messages for a class
router.route("/:classId").get(verifyJWT, getMessages);
router.route("/room/?room=cdcsk").get(verifyJWT, getMessages);

// Send a message in a class
router.route("/:classId/send").post(verifyJWT, sendMessage);
// router.route("/room/?room=cdcsk").post(verifyJWT, sendMessage);

export default router;