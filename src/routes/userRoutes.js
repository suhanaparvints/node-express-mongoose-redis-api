import express from "express";
import { nameUpdate, replaceUser } from "../controllers/userController.js";
import { verifyOwnership, verifyUser } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { replaceUserSchema, updateNameSchema } from "../validators/userValidators.js";
import { userLogin } from "../controllers/authController.js";
import { loginValidation } from "../validators/authValidators.js";

const userRoutes = express.Router();

userRoutes.post("/login", validate({ body: loginValidation }), userLogin);
userRoutes.patch("/:id", verifyUser, validate(updateNameSchema), verifyOwnership, nameUpdate);
userRoutes.put("/:id", verifyUser, validate(replaceUserSchema), verifyOwnership, replaceUser);

export default userRoutes;
