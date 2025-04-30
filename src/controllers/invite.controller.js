import Classes from "../models/class.model.js"; // Import the Class model
import Invite  from "../models/invite.model.js"; // Import the Invite model
import { User}  from "../models/user.model.js"; // Import the User model
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from '../utils/apiResponse.js';

import { Organization } from "../models/organization.model.js"; // Import the Organization model    
const inviteUser = asyncHandler(async (req, res) => {
    const { username } = req.body; // Get username from the request body
    const { classId } = req.params; // Get classId from the URL params

    if (!username || !classId) {
        return res.status(400).json({ message: "Username and class ID are required" });
    }

    // Check if the user exists
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is already invited to the class
    const existingInvite = await Invite.findOne({ username, class: classId });
    if (existingInvite) {
        return res.status(400).json({ message: "User is already invited to this class" });
    }

    // Create a new invite
    const newInvite = new Invite({
        username,
        class: classId, // Use 'class' instead of 'classes'
        invitedBy: req.user.id, // Assuming the inviter's ID is available in req.user
    });

    await newInvite.save();

    return res.status(200).json(new apiResponse(200, newInvite, "User invited successfully"));
});


const acceptInvite = asyncHandler(async (req, res) => {
    const { inviteId } = req.params;
    const userId = req.user.id;
    const username = req.user.username;

    // Find the invite
    const invite = await Invite.findById(inviteId);
    if (!invite) {
        return res.status(404).json({ message: "Invite not found" });
    }

    // Ensure invite is for this user
    if (invite.username !== username) {
        return res.status(403).json({ message: "You are not authorized to accept this invite" });
    }

    // Find the class using the correct reference
    const classToJoin = await Classes.findById(invite.class._id || invite.class);
    if (!classToJoin) {
        return res.status(404).json({ message: "Class not found" });
    }

    // Check if user is already in the class
    const isAlreadyMember = classToJoin.students.some(
        (student) => student.user.toString() === userId
    );
    if (isAlreadyMember) {
        return res.status(400).json({ message: "You are already a member of this class" });
    }

    // Add user to class
    classToJoin.students.push({ user: userId });
    await classToJoin.save();

    // Update invite status
    invite.status = "Accepted";
    await invite.save();

    // Find the organization associated with the class
    const organization = await Organization.findById(classToJoin.organization);
    if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
    }

    // Add user to organization members
    const isAlreadyOrgMember = organization.members.some(
        (member) => member.user.toString() === userId
    );
    if (!isAlreadyOrgMember) {
        organization.members.push({ user: userId, role: "member" });
        await organization.save();
    }

    return res.status(200).json(
        new apiResponse(200, classToJoin, "Invite accepted, user added to the class and organization successfully")
    );
});


const fetchInvites = asyncHandler(async (req, res) => {
    const username = req.user.username; // Assuming the username is available in req.user
    console.log("Fetching invites for user:", username);
    // Fetch invites for the logged-in user
    const invites = await Invite.find({ username })
        .populate("invitedBy", "username") // Populate inviter details (name and email)
        .populate("class", "name description"); // Populate class details (name and description)

    if (!invites || invites.length === 0) {
        return res.status(404).json({ message: "No invites found" });
    }

    return res.status(200).json(new apiResponse(200, invites, "Invites fetched successfully"));
});


const declineInvite = asyncHandler(async (req, res) => {
    const { inviteId } = req.params;
    const userId = req.user.id;
    const username = req.user.username;
  
    // Find the invite
    const invite = await Invite.findById(inviteId);
    if (!invite) {
      return res.status(404).json({ message: "Invite not found" });
    }
  
    // Ensure invite is for this user
    if (invite.username !== username) {
      return res.status(403).json({ message: "You are not authorized to decline this invite" });
    }
  
    // If already accepted or declined
    if (invite.status === "Accepted" || invite.status === "Declined") {
      return res.status(400).json({ message: `Invite already ${invite.status.toLowerCase()}` });
    }
  
    // Update the invite status to Declined
    invite.status = "Declined";
    await invite.save();
  
    return res.status(200).json(
      new apiResponse(200, invite, "Invite declined successfully")
    );
  });
  

export { inviteUser, acceptInvite, fetchInvites, declineInvite };
