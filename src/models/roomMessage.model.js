import mongoose from "mongoose";

const roomMessageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        roomId: {
            type: String,
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        messageType: {
            type: String,
            enum: ["instant", "organization", "class"],
            default: "instant"
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: false,
        },
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Classes",
            required: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        }
    },
    { timestamps: true }
);

export const RoomMessage = mongoose.model("RoomMessage", roomMessageSchema);
