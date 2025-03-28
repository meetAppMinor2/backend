//create by bhavesh 
// organization schema 
import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    members:[{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        role: {
            type: String,
            enum: ["admin", "member"],
            default: "member"
        }
    }]
    // chats: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Chat"
    // }]
},{timestamps: true});
export const Organization = mongoose.model("Organization", organizationSchema);