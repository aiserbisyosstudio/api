import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import UserPlan from '../models/user.plan.model.js';
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.util.js";

export const loginUser = async ({ emailMobile, password }) => {
  if ([emailMobile, password].some((field) => field?.trim() === "")) {
    throw new Error("All fields are required");
  }

  const user = await User.findOne({
    $or: [{ mobile: emailMobile }, { email: emailMobile }],
  });
  if (!user) {
    throw new Error("User not found. Please register to continue.");
  }

  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  await User.findByIdAndUpdate(user._id, {
    isLoggedIn: true,
    lastLoginAt: new Date(),
  });

  const loggedInUser = await User.findById(user._id).select(
    "_id name email mobile role is_active credits profile_url",
  ).lean();

  const plan = await UserPlan.findOne({ userId: loggedInUser._id }).populate("planId", "code");
  loggedInUser.availableCredits = plan?.remainingCredits ?? 0;
  loggedInUser.memberShipStatus = plan?.planId?.code ?? "new";

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  return { user: loggedInUser, userPlan: plan, accessToken, refreshToken };
};