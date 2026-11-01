import express from "express";
import { verifyAdmin } from "../middleware/authMiddleware.js";
import { deleteUser, getAllUsers, replaceUser } from "../controllers/userController.js";
import { validate } from "../middleware/validate.js";
import { deleteUserSchema, replaceUserSchema } from "../validators/userValidators.js";
import { adminLogin } from "../controllers/authController.js";
import { loginValidation } from "../validators/authValidators.js";

const adminRoutes = express.Router();

adminRoutes.post("/login", validate({ body: loginValidation }), adminLogin);
adminRoutes.get("/users", verifyAdmin, getAllUsers);
adminRoutes.put("/users/:id", verifyAdmin, validate(replaceUserSchema), replaceUser);
adminRoutes.delete("/users/:id", verifyAdmin, validate(deleteUserSchema), deleteUser);

export default adminRoutes;
