import e from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import { uploadCloud } from '../utils/cloudnary.js';
import { apiResponse } from '../utils/apiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, fullname, password } = req.body;

    // the some method tests whether at least one element in the array passes the test implemented by the provided function by trimming the fields
    // here i use ? beacause the fields can be null
    if ([username, email, fullname, password].some((field) => field?.trim() === '')) {
        throw new apiError(400, 'Please fill all the details');
    }

    // check if user already exists: username, email
    // it uses the findOne method to find a user with the same username or email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new apiError(409, 'User already exists with this username or email');
    }


    // the below code is used to check if the avatar field is an array and has a length greater than 0 means weather it is undefined or not because having a undefined field will throw an error
    let avatarLocalPath;
    const avatarCloudinary = null;
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {

        avatarLocalPath = req.files?.avatar[0]?.path;

        // upload them to cloudinary, avatar
        avatarCloudinary = await uploadCloud(avatarLocalPath);

        if (!avatarCloudinary) {
            throw new apiError(500, 'Error uploading avatar');
        }
    }



    const user = await User.create({
        fullname,
        username,
        email,
        password,
        avatar: avatarCloudinary?.url || ""

    })

    // the .select method is used to remove the password and refreshToken fields from the response by setting them to false
    // it will use - to remove the fields and seprate them by space
    const createdUser = await User.findById(user._id).select('-password -refreshToken');

    if (!createdUser) {
        throw new apiError(500, 'Error creating user');
    }

    res.status(201).json(new apiResponse(createdUser, 'User created successfully'));


});

export { registerUser };