import express from "express";
import { validate } from "../middleware/validate.js";
import { registerValidation } from "../validators/authValidators.js";
import { registerUser } from "../controllers/authController.js";

const authRoutes = express.Router();

authRoutes.post("/register", validate({ body: registerValidation }), registerUser);

export default authRoutes;
