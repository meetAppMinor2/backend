import e from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import { uploadCloud } from '../utils/cloudnary.js';
import { apiResponse } from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
});

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = await user.generateAccessToken();
        console.log(accessToken);
        const refreshToken = await user.generateRefreshToken();
        console.log(refreshToken);

        // save the refresh token to the database
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new apiError(500, 'Error generating tokens');

    }
};

const registerUser = asyncHandler(async (req, res) => {

    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


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
    let avatarCloudinary = null;
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {

        avatarLocalPath = req.files?.avatar[0]?.path;
        console.log(req.files?.avatar)
        console.log(req.files?.avatar[0])
        console.log(req.files?.avatar[0].path)

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

    return res.status(201).json(new apiResponse(200, createdUser, 'User created successfully'));


});


// path -> http://localhost:3000/api/v1/users/login

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const { username, email, password } = req.body;

    // the below code is used to check if the username or email is not provided
    // if (!(username || email)) {
    //     throw new apiError(400, 'Please provide username or email');
    // }
    if (!(username || email)) {
        throw new apiError(400, "username or email is required")
    }
    // if (!username || !email) {
    //     throw new apiError(400, "username or email is required")
    // }
    if (!password) {
        throw new apiError(400, 'Please provide password');
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });

    if (!user) {
        throw new apiError(404, 'User not found');
    }

    const isValidPass = await user.isPasswordCorrect(password);
    if (!isValidPass) {
        throw new apiError(401, 'Invalid user credentials');
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedinUser = await User.findById(user._id).select('-password -refreshToken')


    // the below code is used to don't allow user to edit cookie manually
    // it require a http request to set the cookie
    // where as secure is used to make the cookie only available in http
    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200).cookie('refreshToken', refreshToken, options).cookie('accessToken', accessToken, options).json(new apiResponse(200, { user: loggedinUser, accessToken: accessToken, refreshToken: refreshToken }, 'User logged in successfully'));

});

// path -> http://localhost:3000/api/v1/users/logout

const loggedoutuser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id,
        {
            $set: { refreshToken: undefined }
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
        SameSite: "None"
    }

    res.status(200).clearCookie('refreshToken', options).clearCookie('accessToken', options).json(new apiResponse(200, {}, 'User logged out successfully'));
});


const refreshAccessToken = asyncHandler(async (req, res) => {
    // const incomingrefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    const incomingrefreshToken =  req.body.refreshToken;

    if (!incomingrefreshToken) {
        throw new apiError(401, 'Unauthorized request');
    }
    try {
        const decodedToken = jwt.verify(incomingrefreshToken, `${process.env.REFRESH_TOKEN_SECRET}`)
        console.log("decoded token ----------->"+decodedToken._id)
        const user = await User.findById(decodedToken._id)
        if (!user) {
            throw new apiError(404, 'Invalid refresh token');
        }
        if (user.refreshToken != incomingrefreshToken) {
            console.log("incoming token= "+incomingrefreshToken+"\n")
            console.log("existing token= "+user.refreshToken+"\n")
            throw new apiError(401, 'refresh token is expired or used');
        }

        const options = {
            httpOnly: true,
            secure: true,
        }
        

        const { accessToken: newaccessToken, refreshToken: newrefreshToken } = await generateAccessAndRefreshToken(user._id);
        console.log("access token "+newaccessToken);
        console.log("refresh token "+newrefreshToken);
        

        return res.status(200).cookie('refreshToken', newrefreshToken, options).cookie('accessToken', newaccessToken, options).json(new apiResponse(200, { accessToken: newaccessToken, refreshToken: newrefreshToken }, 'Token refreshed successfully'));

    } catch (error) {
        throw new apiError(401, error?.message || 'Invalid request token');

    }
})

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
        throw new apiError(400, 'Please provide old password and new password');
    }

    if (newPassword !== confirmPassword) {
        throw new apiError(400, 'Password and confirm password does not match');
    }

    const user = await User.findById(req.user?._id);
    const isValidPass = await user.isPasswordCorrect(oldPassword);

    if (!isValidPass) {
        throw new apiError(401, 'Invalid user credentials');
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false }); // to avoid the pre save hook

    // generate new token because password is changed now
    const { newaccessToken, newrefreshToken } = await generateAccessAndRefreshToken(user._id);

    return res.status(200).cookie('refreshToken', newrefreshToken, options).cookie('accessToken', newaccessToken, options).json(new apiResponse(200, {}, 'Password changed successfully'));

});

const getCurrentUser = asyncHandler(async (req, res) => {

    const incomingaccessToken =  req.body.accessToken;

    if (!incomingaccessToken) {
        throw new apiError(401, 'Unauthorized request');
    }
    try {
        const decodedToken = jwt.verify(incomingaccessToken, `${process.env.ACCESS_TOKEN_SECRET}`)
        console.log("decoded access token ----------->"+decodedToken._id)
        const user = await User.findById(decodedToken._id).select('-password -refreshToken');  
        if (!user) {
            throw new apiError(404, 'Invalid refresh token');
        }
        // const user = await User.findById(req.user?._id).select('-password -refreshToken');  
        return res.status(200).json(new apiResponse(200, user, 'User details fetched successfully'));
    } catch (error) {
        throw new apiError(401, error?.message || 'Invalid access token');
    }
    
});

const updateAvatar = asyncHandler(async (req, res) => {
    console.log("filee")
    console.log(req.files?.avatar)
    const usr = await JSON.parse(req.body.user);
    console.log(usr)
    const avatarLocalPath = req.files?.avatar[0]?.path;

    if (!avatarLocalPath) {
        throw new apiError(400, 'Please upload an avatar');
    }

    const avatarCloudinary = await uploadCloud(avatarLocalPath);

    if (!avatarCloudinary.url) {
        throw new apiError(500, 'Error uploading avatar');
    }
    // console.log(req.user);
    console.log(req.body.user);
    // console.log(req.body.user);
    console.log(usr["_id"])

    // the new : true is used to return the updated document, by default this function returns the old document
    const user = await User.findByIdAndUpdate(usr._id, { $set:{ avatar: avatarCloudinary.url }  }, { new: true }).select('-password -refreshToken');
    console.log(user)
    return res.status(200).json(new apiResponse(200, user, 'Avatar updated successfully'));
});


const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const users = await User.find().select('-password -refreshToken');
        return res.status(200).json(new apiResponse(200, users, 'Users fetched successfully'));
    } catch (error) {
        throw new apiError(500, 'Error fetching users');
    }
});

export { registerUser, loginUser, loggedoutuser, refreshAccessToken, updateAvatar, getCurrentUser, changePassword, getAllUsers };