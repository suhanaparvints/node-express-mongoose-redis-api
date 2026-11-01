import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "error",
      message: "Authorization token is required",
    });
  }

  const token = authHeader.slice("Bearer ".length);
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({
      status: "error",
      message: "Invalid or expired token",
    });
  }

  if (
    !decoded ||
    typeof decoded !== "object" ||
    typeof decoded.id !== "string" ||
    !/^[a-f\d]{24}$/i.test(decoded.id) ||
    !["admin", "user"].includes(decoded.role)
  ) {
    return res.status(401).json({
      status: "error",
      message: "Invalid or expired token",
    });
  }

  const account = await User.findById(decoded.id).select("role");
  if (!account || account.role !== decoded.role) {
    return res.status(401).json({
      status: "error",
      message: "Invalid or expired token",
    });
  }

  req.user = { id: account._id.toString(), role: account.role };
  next();
};

export const verifyAdmin = (req, res, next) => {
  return verifyToken(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Admin access required",
      });
    }
    next();
  });
};

export const verifyUser = (req, res, next) => {
  return verifyToken(req, res, () => {
    if (req.user.role !== "user") {
      return res.status(403).json({
        status: "error",
        message: "User access required",
      });
    }
    next();
  });
};

export const verifyOwnership = (req, res, next) => {
  if (typeof req.user.id !== "string" || req.user.id.toLowerCase() !== req.params.id.toLowerCase()) {
    return res.status(403).json({
      status: "error",
      message: "You can only update your own account",
    });
  }

  next();
};
