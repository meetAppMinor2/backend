import { Router } from "express";
import { registerUser, loginUser, loggedoutuser, refreshAccessToken, getCurrentUser, updateAvatar, getAllUsers, getAllOrganizations, createOrganization} from "../controllers/user.controller.js";
import {upload} from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

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

router.route("/organizations").post(getAllOrganizations); //route for getting all the organizations 
router.route("/createOrganization").post(verifyJWT, createOrganization); //route for creating a new organization

export default router;