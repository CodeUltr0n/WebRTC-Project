import express from "express";
import mongoose from "mongoose";
import {createServer} from "node:http";
import { connectToSocket } from "./controllers/SocketManager.js";
import userRoutes from "./routes/user.routes.js";
import {Server} from "socket.io";

import cors from "cors";

import dotenv from "dotenv";
dotenv.config();

const app = express(); /// maintaining cors 
const server = createServer(app);
const io = connectToSocket(server);

app.set("port" , (process.env.PORT || 8000))
app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb",extended:true}))

app.use("/api/v1/users",userRoutes);


const start = async () => {
  try {
    const connectTodb = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MONGO Connected DB Host: ${connectTodb.connection.host}`);

    server.listen(app.get("port"), () => {
      console.log(`Listening on port ${app.get("port")}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

start();
