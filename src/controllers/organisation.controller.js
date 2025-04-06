import e from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { Organization } from '../models/organization.model.js';
import { apiResponse } from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
});



//added by bhavesh - getAllOraganization 
const getAllOrganizations = asyncHandler(async (req, res) => {
    try {
        // Extract the access token from the Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new apiError(401, "Unauthorized request: No access token provided");
        }

        const accessToken = authHeader.split(" ")[1]; // Extract the token after "Bearer"

        // Decode the access token to get the user ID
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const userId = decodedToken._id;

        if (!userId) {
            throw new apiError(401, "Invalid access token");
        }

        // Find organizations where the user is the owner or a member
        const organizations = await Organization.find({
            $or: [
                { owner: userId },
                { "members.user": userId }
            ]
        })
            .populate("owner", "username email")
            .populate("members.user", "username email");

        if (!organizations?.length) {
            return res.status(200).json(
                new apiResponse(200, [], "No organizations found")
            );
        }

        return res.status(200).json(
            new apiResponse(200, organizations, "Organizations fetched successfully")
        );
    } catch (error) {
        console.error(error);
        throw new apiError(500, error.message || "Error fetching organizations");
    }
});

const createOrganization = asyncHandler(async (req, res) => {
    const {name, description} = req.body;

    const existingOrganization = await Organization.findOne({ name, owner: req.user._id }); 
        if (existingOrganization) {
            return res.status(400).json({ message: "Organization name already exists" });
        }

    if(!name){
        return res.status(400).json({message: "Organization name is required"});    
    }
    const newOrganization = new Organization({name, description, owner: req.user._id});
    await newOrganization.save();
    return res.status(200).json(new apiResponse(200, newOrganization, "Organization created successfully"));
});



export {getAllOrganizations, createOrganization}