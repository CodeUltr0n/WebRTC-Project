import { User } from "../models/user.models.js";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import crypto from "crypto";
import mongoose from "mongoose";

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Please provide username and password" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid credentials" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.token = token;
    await user.save();

    return res.status(httpStatus.OK).json({ token });
  } catch (e) {
    return res.status(500).json({ message: `Something went wrong ${e}` });
  }
};

const register = async (req, res) => {

  const { name, username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(httpStatus.CONFLICT).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(httpStatus.CREATED).json({ message: "User registered successfully" });
  } catch (e) {
    res.status(500).json({ message: `Something went wrong ${e}` });
  }
};

const getUserhistory = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
    }

    res.status(httpStatus.OK).json(user.meetingHistory || []);
  } catch (e) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: `Something went wrong ${e}`
    });
  }
};

const addToHistory = async (req, res) => {
  const { token, meeting_code } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
    }

    if (!user.meetingHistory) {
      user.meetingHistory = [];
    }

    user.meetingHistory.push({
      meetingCode: meeting_code,
      joinedAt: new Date()
    });

    await user.save();

    res.status(httpStatus.CREATED).json({
      message: "Added code to history"
    });
  } catch (e) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: `Something went wrong ${e}`
    });
  }
};

export { login, register, getUserhistory, addToHistory };