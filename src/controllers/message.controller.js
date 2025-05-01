import { Message } from "../models/message.model.js";   
import { User } from "../models/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Classes from "../models/class.model.js";

const getMessages = async (req, res) => {
    try {
        const { classId } = req.params;
        console.log("classId: ", classId);  
        // Get all messages for the class, sorted by creation time
        const messages = await Message.find({ classId })
            .populate("senderId", "username fullname avatar");
            // .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// const getGroupMessages = async (req, res) => {
//     try {
//       const { groupId } = req.params;
//       const messages = await Message.find({ groupId, messageType: "group" })
//         .populate("senderId", "fullName profilePic");
  
//       res.status(200).json(messages);
//     } catch (error) {
//       console.log("Error in getGroupMessages controller:", error.message);
//       res.status(500).json({ message: "Internal Server Error" });
//     }
//   };


const sendGroupMessage = async (req, res) => {
    try {
      const { text, image } = req.body;
      const { classId } = req.params;
      const senderId = req.user._id;
  
      let imageUrl;
      if (image) {
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
      }
  
      const newMessage = new Message({
        senderId,
        groupId,
        text,
        image: imageUrl,
        messageType: "group",
      });
  
      await newMessage.save();
  
      // Populate sender information
      const populatedMessage = await Message.findById(newMessage._id)
        .populate("senderId", "fullName profilePic");
  
      // Get group members to send message to
      const group = await Group.findById(groupId);
      const memberSocketIds = group.members
        .filter(memberId => memberId.toString() !== senderId.toString())
        .map(memberId => getReceiverSocketId(memberId.toString()));
  
      // Emit message to all group members
      memberSocketIds.forEach(socketId => {
        if (socketId) {
          io.to(socketId).emit("newGroupMessage", populatedMessage);
        }
      });
  
      res.status(201).json(populatedMessage);
    } catch (error) {
      console.log("Error in sendGroupMessage controller:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  
  

  const sendMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const { classId } = req.params;
        const senderId = req.user._id;

        // Create new message
        const newMessage = new Message({
            senderId,
            classId,
            text,
        });

        // Save message to database
        const savedMessage = await newMessage.save();

        // Populate sender information
        const populatedMessage = await Message.findById(savedMessage._id)
            .populate("senderId", "username fullname");

        // Emit the message to all users in the class room
        const group = await Classes.findById(classId);
        const memberSocketIds = group.students
            .filter(student => student.user.toString() !== senderId.toString())
            .map(student => getReceiverSocketId(student.user.toString()));

        // Emit message to all class members
        memberSocketIds.forEach(socketId => {
            if (socketId) {
                io.to(socketId).emit("newMessage", populatedMessage);
            }
        });

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export { getMessages, sendMessage };