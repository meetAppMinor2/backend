import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
    name: { 
        type: String,
        required: true 
    },
    description: {
         type: String
         },
    organization: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Organization", required: true 
        },
    students: [
        {
            user: {
                 type: mongoose.Schema.Types.ObjectId,
                 ref: "User" 
                }, // Reference to User model
            role: {
                 type: String, 
                 enum: ["student", "teacher"], 
                 default: "student" 
                }, // Role in the class
            joinedAt: {
                 type: Date, 
                 default: Date.now 
                }, // When the user joined the class
        }
    ],
},{ timestamps: true });    

const Classes = mongoose.model('Classes', classSchema); 
export default Classes; 
