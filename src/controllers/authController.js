import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v7 as uuidv7 } from "uuid";
import User from "../models/User.js";
import { invalidateUserListCache } from "../utils/userCache.js";

const normalizeEmail = (email) => email.trim().toLowerCase();

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  const admin = await User.findOne({
    email: normalizeEmail(email),
  }).select("+password");

  if (!admin || admin.role !== "admin") {
    return res.status(401).json({
      status: "error",
      message: "Invalid email or password",
    });
  }

  const isPasswordMatch = await bcrypt.compare(password, admin.password);
  if (!isPasswordMatch) {
    return res.status(401).json({
      status: "error",
      message: "Invalid email or password",
    });
  }

  const token = jwt.sign(
    {
      id: admin._id.toString(),
      role: admin.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  return res.status(200).json({
    status: "OK",
    message: "Admin login successful",
    token,
  });
};

export const registerUser = async (req, res) => {
  const { name, age, email, address, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    userId: uuidv7(),
    name,
    age,
    address,
    email: normalizeEmail(email),
    password: hashedPassword,
    role: "user",
  });
  await invalidateUserListCache();

  return res.status(201).json({
    status: "ok",
    message: "Successfully registered",
  });
};

export const userLogin = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email: normalizeEmail(email),
  }).select("+password");

  if (!user || user.role !== "user") {
    return res.status(401).json({
      status: "error",
      message: "Invalid email or password",
    });
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    return res.status(401).json({
      status: "error",
      message: "Invalid email or password",
    });
  }

  const token = jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  return res.status(200).json({
    status: "OK",
    message: "User login successful",
    token,
  });
};
