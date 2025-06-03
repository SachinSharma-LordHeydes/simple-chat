const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const authRouter = require("./routes/authRoutes");
const chatRouter = require("./routes/chatRoutes");
const dbConnect = require("./config/dbConnect");
const { saveMessage } = require("./controllers/chatController");

const app = express();
app.use(express.json());
const server = http.createServer(app);

dbConnect();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const users = new Map(); //to map socketid with mongoose _id {socketid->_id}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register", (userId) => {
    console.log("Registered userId:", userId);
    users.set(userId, socket.id);
    socket.emit("registered", { success: true });
  });

  socket.on("private-message", async ({ senderId, receiverId, message }) => {
    try {
      const messageData = {
        senderId,
        receiverId,
        message,
        timestamp: new Date(),
      };

      const savedMessage = await saveMessage(messageData);

      const receiverSocketId = users.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("private-message", {
          senderId,
          receiverId,
          message,
          timestamp: savedMessage.timestamp,
          _id: savedMessage._id,
        });
      }

      socket.emit("message-sent", {
        success: true,
        messageId: savedMessage._id,
        timestamp: savedMessage.timestamp,
      });

      console.log(`Message from ${senderId} to ${receiverId}: ${message}`);
    } catch (error) {
      console.error("Error handling private message:", error);
      socket.emit("message-error", { error: "Failed to send message" });
    }
  });

  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocketId = users.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("user-typing", { userId: senderId });
    }
  });

  socket.on("stop-typing", ({ senderId, receiverId }) => {
    const receiverSocketId = users.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("user-stop-typing", { userId: senderId });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    for (let [userId, socketId] of users.entries()) {
      if (socketId === socket.id) {
        users.delete(userId);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Socket.IO + Express server running on port ${PORT}`);
});
