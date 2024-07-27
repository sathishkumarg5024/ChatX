import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import Message from "./model/MessagesModel.js";
import Channel from "./model/ChannelModel.js";

const setupSocket = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  const disconnect = (socket) => {
    console.log(`Client Disconnected: ${socket.id}`);
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };

  const sendMessage = async (message) => {
    const senderSocketId = userSocketMap.get(message.sender);
    const recipientSocketId = userSocketMap.get(message.recipient);

    const createdMsg = await Message.create(message);

    const messageData = await Message.findById(createdMsg._id)
      .populate("sender", "id email firstName lastName image color")
      .populate("recipient", "id email firstName lastName image color");

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("recieveMessage", messageData);
    }

    if (senderSocketId) {
      io.to(senderSocketId).emit("recieveMessage", messageData);
    }
  };

  const sendChannelMsg = async (msg) => {
    const { channelId, sender, content, messageType, fileUrl } = msg;
    const createdMsg = await Message.create({
      sender,
      recipient: null,
      content,
      messageType,
      timeStamp: new Date(),
      fileUrl,
    });

    const msgData = await Message.findById(createdMsg.id)
      .populate("sender", "id email firstName lastName image color")
      .exec();

    await Channel.findByIdAndUpdate(channelId, {
      $push: { messages: createdMsg._id },
    });

    const channel = await Channel.findById(channelId).populate("members");

    const finalData = { ...msgData._doc, channelId: channel._id };

    if (channel && channel.members) {
      channel.members.forEach((member) => {
        const memberSocketId = userSocketMap.get(member._id.toString());
        if (memberSocketId) {
          io.to(memberSocketId).emit("recieve-channel-message", finalData);
        }
      });
      const adminSocketId = userSocketMap.get(channel.admin._id.toString());
      if (adminSocketId) {
        io.to(adminSocketId).emit("recieve-channel-message", finalData);
      }
    }
  };

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User connected ${userId} with socket ID: ${socket.id}`);
    } else {
      console.log(`User ID not provided during connection`);
    }

    socket.on("sendMessage", sendMessage);
    socket.on("send-channel-message", sendChannelMsg);
    socket.on("disconnect", () => disconnect(socket));
  });
};

export default setupSocket;
