import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "./user.model.js";

const InstantMeetingSchema = new Schema({
    host:{
        type:Schema.Types.ObjectId,
        ref: User,
        required:true
    },

    memebrs:[{
        type:Schema.Types.ObjectId,
        ref: "User" ,
        
    }],

    duration:{
        type:String,
        default="",
    },

    recording:{
        type:String,
        default:"",
    },

    meetingCode:{
        type:String,
        default:NULL,
        required:true
    },
    isActive:{
        type:boolean,
        default:true;
    }
},{timestamps:true});

const InstantMeeting=mongoose.model('InstantMeeting',InstantMeetingSchema);
export default InstantMeeting;
