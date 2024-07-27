import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import {
  createChannel,
  getChannelMsgs,
  getUsersChannel,
} from "../controllers/ChannelControllers.js";

const channelRoutes = Router();

channelRoutes.post("/create-channel", verifyToken, createChannel);
channelRoutes.get("/get-user-channels", verifyToken, getUsersChannel);
channelRoutes.get("/get-channel-msgs/:channelId", verifyToken, getChannelMsgs);

export default channelRoutes;
