// import mongoose, { Schema } from "mongoose";
// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

// const InstantMeetingSchema = new Schema({
//     meeting_id:{
//         type: String,
//         required: [true,"Meeting ID is required"],
//         unique: true,
//         trim: true,
//         index: true
//     },
//     host: {
//         type: String,
//         required: [true, "Host is required."],
//         trim: true,
//     },

//     members: {
//         type: [String],
//         required: [true, "Member is required."],
//         validate: {
//             validator: function (members) {
//                 return members.length > 0;
//             },
//             message: "At least one member is required."  
//         },
//         trim: true,
//     },
//     // duration: {
//     //     type: Number,
//     //     required: [true, "Duration is required."],
//     //     min: [1, "at least 1 minute"],
//     // },
//     recordings: {
//         type: [Stirng],
//         default: []
//     },
//     created_at: {
//         type: Date,
//         default: Date.now
//     },
    
//     updated_at: {
//         type: Date,
//         default: Date.now
//     }

// });


// export const InstantMeeting = mongoose.model("InstantMeeting", InstantMeetingSchema);
