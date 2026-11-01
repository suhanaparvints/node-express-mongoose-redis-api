import "dotenv/config";
import bcrypt from "bcrypt";
import Joi from "joi";
import mongoose from "mongoose";
import { v7 as uuidv7 } from "uuid";
import connectDB from "../config/db.js";
import { closeRedis, connectRedis } from "../config/redis.js";
import User from "../models/User.js";
import { validateBcryptPasswordLength } from "../validators/authValidators.js";
import { invalidateUserListCache } from "../utils/userCache.js";

const adminSchema = Joi.object({
  name: Joi.string().trim().min(3).max(50).required(),
  age: Joi.number().integer().min(10).max(150).required(),
  email: Joi.string().trim().lowercase().email().required(),
  address: Joi.string().trim().min(5).max(300).required(),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,128}$/)
    .custom(validateBcryptPasswordLength)
    .required(),
}).messages({
  "string.maxBytes": "Password must not exceed bcrypt's 72-byte limit",
});

const { value, error } = adminSchema.validate(
  {
    name: process.env.ADMIN_NAME,
    age: process.env.ADMIN_AGE,
    email: process.env.ADMIN_EMAIL,
    address: process.env.ADMIN_ADDRESS,
    password: process.env.ADMIN_PASSWORD,
  },
  { abortEarly: false, convert: true },
);

if (error) {
  throw new Error(`Invalid admin seed configuration: ${error.details.map(({ message }) => message).join("; ")}`);
}

try {
  await connectDB();
  await connectRedis();
  await User.init();

  const existingUser = await User.findOne({ email: value.email });
  if (existingUser) {
    if (existingUser.role !== "admin") {
      throw new Error("The configured email belongs to a non-admin user; seeding will not promote existing users.");
    }

    console.log(`Admin account already exists: ${value.email}`);
  } else {
    const { password: adminPassword, ...adminDetails } = value;
    const password = await bcrypt.hash(adminPassword, 10);
    await User.create({
      userId: uuidv7(),
      ...adminDetails,
      password,
      role: "admin",
    });
    await invalidateUserListCache();
    console.log(`Admin account seeded: ${value.email}`);
  }
} catch (seedError) {
  console.error(`Admin seeding failed: ${seedError.message}`);
  process.exitCode = 1;
} finally {
  await closeRedis();
  await mongoose.disconnect();
}
