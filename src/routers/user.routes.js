import { Router } from "express";
import { registerUser, loginUser, loggedoutuser, refreshAccessToken,getMultipleUserDetails, getCurrentUser, updateAvatar, getAllUsers} from "../controllers/user.controller.js";
import {upload} from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { fetchInvites, acceptInvite, declineInvite } from "../controllers/invite.controller.js";
import { getClassMembers } from "../controllers/class.controller.js"; // Importing the class controller

const router = Router();

router.route("/register").post(
    upload.fields([
        { name: 'avatar', maxCount: 1 }
    ]),
    // accept multiple files with the same fieldname 

    registerUser); // it will send a post request to the registerUser function in the user.controller.js file

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT, loggedoutuser)
// here the 'next()' function is used to pass the control to the loggedoutuser function in the user.controller.js file

router.route("/refreshToken").post(refreshAccessToken);


router.route("/getUserDetail").post(getCurrentUser);
router.route("/updateAvatar").post(
    upload.fields([
        { name: 'avatar', maxCount: 1 }
    ]), updateAvatar);

router.route("/getUsers").get(verifyJWT, getAllUsers);
router.route("/invites").get(verifyJWT, fetchInvites); 
router.route("/invites/:inviteId/accept").post(verifyJWT, acceptInvite); // Accept an invite
router.route("/invites/:inviteId/decline").post(verifyJWT, declineInvite); // Accept an invite
router.route("/classes/:classId/members").get(verifyJWT, getClassMembers);
router.route("/getMultipleUsers").post(verifyJWT,getMultipleUserDetails) // Get all members of a class
export default router;