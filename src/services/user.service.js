import User from "../models/user.model.js";
import Plan from "../models/plan.model.js";
import UserPlan from "../models/user.plan.model.js";
import bcrypt from "bcryptjs";

export const registerUser = async ({ name, email, mobile, password }) => {
  if ([name, email, mobile, password].some((field) => field?.trim() === "")) {
    throw new Error("All fields are required");
  }

  const exists = await User.findOne({ $or: [{ mobile }, { email }] });
  if (exists) {
    throw new Error("User already exists. Please login to continue");
  }

  const user = await User.create({ name, email, mobile, password });

  return user;
};

export const updateLanguage = async ({ userId, code, label }) => {
  if ([userId, code, label].some((field) => field?.trim() === "")) {
    throw new Error("All fields are required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("Please login to update language");
  }

  user.language = {
    code: code,
    label: label,
  };
  await user.save();
};

export const updateUserPlan = async ({ userId, code }) => {
  if ([userId, code].some((field) => field?.trim() === "")) {
    throw new Error("All fields are required");
  }

  const plan = await Plan.findOne({ code }).select("_id credits code");

  const exists = await UserPlan.findOne({
    $and: [{ userId }, { planId: plan._id }],
  });
  if (exists) {
    throw new Error("You already have an active plan");
  }

  const userPlan = await UserPlan.create({
    userId,
    planId: plan._id,
    purchasedCredits: plan.credits,
    remainingCredits: plan.credits,
  });
  if (!userPlan) {
    throw new Error("Failed to activate plan");
  }
  return {
    ...userPlan.toObject(),
    planName: plan.code,
  };
};