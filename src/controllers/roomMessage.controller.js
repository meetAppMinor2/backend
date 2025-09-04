import { RoomMessage } from "../models/roomMessage.model.js";
import { User } from "../models/user.model.js";
import { io } from "../lib/socket.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get messages for a specific room
const getRoomMessages = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const { messageType } = req.query;

    let query = { roomId, isActive: true };
    
    // Filter by message type if provided
    if (messageType) {
        query.messageType = messageType;
    }

    const messages = await RoomMessage.find(query)
        .populate("senderId", "username fullname avatar")
        .sort({ createdAt: 1 });

    return res.status(200).json(
        new apiResponse(200, messages, "Room messages fetched successfully")
    );
});

// Send a message to a room
const sendRoomMessage = asyncHandler(async (req, res) => {
    const { text, messageType = "instant", organizationId, classId } = req.body;
    const { roomId } = req.params;
    const senderId = req.user._id;

    if (!text || !text.trim()) {
        throw new apiError(400, "Message text is required");
    }

    // Validate message type and required fields
    if (messageType === "organization" && !organizationId) {
        throw new apiError(400, "Organization ID is required for organization messages");
    }
    
    if (messageType === "class" && !classId) {
        throw new apiError(400, "Class ID is required for class messages");
    }

    const newMessage = new RoomMessage({
        senderId,
        roomId,
        text: text.trim(),
        messageType,
        organizationId: organizationId || undefined,
        classId: classId || undefined,
    });

    const savedMessage = await newMessage.save();

    const populatedMessage = await RoomMessage.findById(savedMessage._id)
        .populate("senderId", "username fullname avatar");

    // Emit message to all users in the room
    io.to(roomId).emit("newRoomMessage", populatedMessage);

    return res.status(201).json(
        new apiResponse(201, populatedMessage, "Message sent successfully")
    );
});

// Get messages for organization/class (persistent chat)
const getOrganizationMessages = asyncHandler(async (req, res) => {
    const { organizationId, classId } = req.params;
    const { messageType } = req.query;

    let query = { isActive: true };
    
    if (organizationId) {
        query.organizationId = organizationId;
        query.messageType = "organization";
    } else if (classId) {
        query.classId = classId;
        query.messageType = "class";
    } else {
        throw new apiError(400, "Either organizationId or classId is required");
    }

    const messages = await RoomMessage.find(query)
        .populate("senderId", "username fullname avatar")
        .sort({ createdAt: 1 });

    return res.status(200).json(
        new apiResponse(200, messages, "Organization/Class messages fetched successfully")
    );
});

// Send message to organization/class
const sendOrganizationMessage = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const { organizationId, classId } = req.params;
    const senderId = req.user._id;

    if (!text || !text.trim()) {
        throw new apiError(400, "Message text is required");
    }

    let messageType, targetId;
    if (organizationId) {
        messageType = "organization";
        targetId = organizationId;
    } else if (classId) {
        messageType = "class";
        targetId = classId;
    } else {
        throw new apiError(400, "Either organizationId or classId is required");
    }

    const newMessage = new RoomMessage({
        senderId,
        roomId: `persistent_${messageType}_${targetId}`, // Create a persistent room ID
        text: text.trim(),
        messageType,
        organizationId: organizationId || undefined,
        classId: classId || undefined,
    });

    const savedMessage = await newMessage.save();

    const populatedMessage = await RoomMessage.findById(savedMessage._id)
        .populate("senderId", "username fullname avatar");

    // Emit to all users in the organization/class
    const roomId = `persistent_${messageType}_${targetId}`;
    io.to(roomId).emit("newRoomMessage", populatedMessage);

    return res.status(201).json(
        new apiResponse(201, populatedMessage, "Message sent successfully")
    );
});

// Delete a message (soft delete)
const deleteMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const senderId = req.user._id;

    const message = await RoomMessage.findById(messageId);
    
    if (!message) {
        throw new apiError(404, "Message not found");
    }

    // Only allow sender to delete their own message
    if (message.senderId.toString() !== senderId.toString()) {
        throw new apiError(403, "You can only delete your own messages");
    }

    message.isActive = false;
    await message.save();

    return res.status(200).json(
        new apiResponse(200, {}, "Message deleted successfully")
    );
});

export { 
    getRoomMessages, 
    sendRoomMessage, 
    getOrganizationMessages, 
    sendOrganizationMessage, 
    deleteMessage 
};
