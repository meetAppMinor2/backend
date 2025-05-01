// // filepath: /Users/bhavesh/Desktop/minor2/backend/src/lib/socket.js
// import { Server } from "socket.io";
// import { app } from "../app.js"; // Import the app from app.js
// import http from "http";
// import { Message } from "../models/message.model.js";
// const server = http.createServer(app);
// import Classes from "../models/class.model.js";
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// // used to store online users
// const userSocketMap = {}; // {userId: socketId}

// export const getReceiverSocketId = (receiverId) => {
//   return userSocketMap[receiverId];
// };

// io.on("connection", (socket) => {
//   console.log("A user connected", socket.id);

//   const userId = socket.handshake.query.userId;
//   if (userId) userSocketMap[userId] = socket.id;

//   // io.emit() is used to send events to all the connected clients
//   io.emit("getOnlineUsers", Object.keys(userSocketMap));

//   // Handle group message events
//   socket.on("joinGroup", (groupId) => {
//     socket.join(groupId);
//   });

//   socket.on("leaveGroup", (groupId) => {
//     socket.leave(groupId);
//   });

//   socket.on("sendMessage", async (message) => {
//     try {
//       const { text, classId, senderId } = message;
  
//       // Create and save message
//       const newMessage = new Message({
//         senderId,
//         classId,
//         text,
//       });
  
//       const savedMessage = await newMessage.save();
  
//       const populatedMessage = await Message.findById(savedMessage._id)
//         .populate("senderId", "username fullname avatar");
  
//       // Notify all members except the sender
//       const group = await Classes.findById(classId);
//       const memberSocketIds = group.students
//         .filter((student) => student.user.toString() !== senderId)
//         .map((student) => getReceiverSocketId(student.user.toString()));
  
//       memberSocketIds.forEach((socketId) => {
//         if (socketId) {
//           io.to(socketId).emit("newMessage", populatedMessage);
//         }
//       });
//     } catch (error) {
//       console.error("Error in socket sendMessage:", error.message);
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log("A user disconnected", socket.id);
//     delete userSocketMap[userId];
//     io.emit("getOnlineUsers", Object.keys(userSocketMap));
//   });
// });

// export { server, io, app};



// filepath: /Users/bhavesh/Desktop/minor2/backend/src/lib/socket.js

import { Server } from "socket.io";
import { app } from "../app.js";
import http from "http";
import { Message } from "../models/message.model.js";
import Classes from "../models/class.model.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap = {}; // { userId: socketId }

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ✅ Ensure this matches frontend: socket.emit("joinClass", classId)
  socket.on("joinClass", (classId) => {
    socket.join(classId);
    console.log(`User ${socket.id} joined class ${classId}`);
  });

  socket.on("leaveGroup", (groupId) => {
    socket.leave(groupId);
  });

  socket.on("sendMessage", async (message) => {
    try {
      const { text, classId, senderId } = message;

      const newMessage = new Message({ senderId, classId, text });
      const savedMessage = await newMessage.save();

      const populatedMessage = await Message.findById(savedMessage._id)
        .populate("senderId", "username fullname avatar");

      // ✅ Emit to everyone in the room, including sender
      io.to(classId).emit("newMessage", populatedMessage);
    } catch (error) {
      console.error("Error in socket sendMessage:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { server, io, app };
