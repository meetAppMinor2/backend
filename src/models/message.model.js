import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Classes",
            required: true,
        },

        text: {
            type: String,
        },

        image: {
            type: String,
        },
    },
    { timestamps: true }
);


export const Message = mongoose.model("Message", messageSchema);
