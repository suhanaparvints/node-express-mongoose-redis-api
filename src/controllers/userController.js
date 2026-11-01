import User from "../models/User.js";
import { cacheUserList, getCachedUserList, invalidateUserListCache } from "../utils/userCache.js";

const publicUser = (user) => ({
  id: user._id.toString(),
  userId: user.userId,
  name: user.name,
  age: user.age,
  email: user.email,
  address: user.address,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const getAllUsers = async (req, res) => {
  const cachedUsers = await getCachedUserList();
  if (cachedUsers !== null) {
    return res.status(200).json({
      status: "OK",
      data: cachedUsers,
    });
  }

  const users = await User.find();
  const publicUsers = users.map(publicUser);
  await cacheUserList(publicUsers);

  return res.status(200).json({
    status: "OK",
    data: publicUsers,
  });
};

export const nameUpdate = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  user.name = req.body.name;
  await user.save();
  await invalidateUserListCache();

  return res.status(200).json({
    status: "OK",
    data: publicUser(user),
  });
};

export const replaceUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  user.name = req.body.name;
  user.age = req.body.age;
  user.email = req.body.email;
  user.address = req.body.address;
  await user.save();
  await invalidateUserListCache();

  return res.status(200).json({
    status: "OK",
    data: publicUser(user),
  });
};

export const deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  await invalidateUserListCache();

  return res.status(200).json({
    status: "OK",
    data: publicUser(user),
  });
};
