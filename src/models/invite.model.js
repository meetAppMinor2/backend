

import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema({
    username: { type: String, required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Classes", required: true }, // Use 'class' instead of 'classes'
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["Pending", "Accepted", "Declined"], default: "Pending" },
});

const Invite = mongoose.model("Invite", inviteSchema);

export default Invite;