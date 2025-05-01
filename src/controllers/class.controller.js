import Classes from "../models/class.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import {Organization} from "../models/organization.model.js"; 

const createClass = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const { organizationId } = req.params;  // get it from URL

    if (!name || !organizationId) {
        return res.status(400).json({ message: "Class name and organization ID are required" });
    }

    // Check if the organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
    }

    // Create the class
    const newClass = new Classes({
        name,
        description,
        organization: organizationId,
    });

    await newClass.save();

    return res.status(200).json(new apiResponse(200, newClass, "Class created successfully"));
});


const getClassesByOrganization = asyncHandler(async (req, res) => {
    const { organizationId } = req.params;

    // Check if the organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
    }

    // Fetch all classes under the organization
    const classes = await Classes.find({ organization: organizationId })
                                 .populate("students.user", "name email") // optional
                                 .sort({ createdAt: -1 }); // optional

    return res.status(200).json(new apiResponse(200, { classes, count: classes.length }, "Classes fetched successfully"));
});

const deleteClass = asyncHandler(async (req, res) => {  
    const { organizationId, classId } = req.params;

    // Check if the organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
    }   
    // Check if the class exists
    const classToDelete = await Classes.findById(classId);
    if (!classToDelete) {
        return res.status(404).json({ message: "Class not found" });
    }
    // Check if the class belongs to the organization
    if (classToDelete.organization.toString() !== organizationId) {
        return res.status(403).json({ message: "You are not authorized to delete this class" });
    }
    // Delete the class 
    await Classes.findByIdAndDelete(classId);
    return res.status(200).json(new apiResponse(200, null, "Class deleted successfully"));
}
);



const getClassMembers = asyncHandler(async (req, res) => {
    const { classId } = req.params;
  
    // Fetch the class with populated user data for all students and organization owner
    const classData = await Classes.findById(classId)
        .populate("students.user", "username avatar") // Populate `user` field with specific fields
        .populate({
            path: "organization",
            select: "owner", // Select only the owner field from the organization
            populate: {
                path: "owner", // Populate the owner field
                select: "username email avatar", // Select specific fields for the owner
            },
        })
        .exec();
  
    // If the class is not found, return 404
    if (!classData) {
        return res.status(404).json({ message: "Class not found" });
    }
  
    // Extract owner and students
    const owner = classData.organization?.owner || null;
    const students = classData.students || [];
  
    // Return the populated class data along with the owner
    return res.status(200).json({
        success: true,
        data: {
            owner,
            students,
        },
    });
  });
  


export { createClass, getClassesByOrganization, deleteClass, getClassMembers };