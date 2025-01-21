import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error.message);
        process.exit(1)
    }
}
export default connectDB



// roomMember=[{
//     member:"room1",
//     role: owner,     //[member,owner,moderator],
// },
// {
//     member:"room2",
//     role: moderator,     //[member,owner,moderator],
// },
// {
//     member:"room3",
//     role: member,     //[member,owner,moderator],   
// }]