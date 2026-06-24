import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.util.js";
import logger from "../config/logger.js";

export const loginUser = async ({ emailMobile, password }) => {
  if ([emailMobile, password].some((field) => field?.trim() === "")) {
    logger.error("Login user: All fields are required");
    throw new Error("All fields are required");
  }

  const user = await User.findOne({
    $or: [{ mobile: emailMobile }, { email: emailMobile }],
  });
  if (!user) {
    logger.error(`Login user: User not found ${emailMobile}`);
    throw new Error("User not found");
  }

  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) {
    logger.error("Login user: Invalid credentials");
    throw new Error("Invalid credentials");
  }

  await User.findByIdAndUpdate(user._id, {
    isLoggedIn: true,
  });

  const loggedInUser = await User.findById(user._id).select(
    "_id name email mobile role is_active credits profile_url",
  );

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  logger.info("Login user: User loggedin successfully");
  return { user: loggedInUser, accessToken, refreshToken };
};