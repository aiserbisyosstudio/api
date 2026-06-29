import User from "../models/user.model.js";
import Plan from "../models/plan.model.js";
import UserPlan from "../models/user.plan.model.js";
import UserUsage from "../models/user.usage.model.js";
import UserLog from "../models/user.log.model.js";
import bcrypt from "bcryptjs";
import { uploadOnCloudinary } from "../utils/cloudinary.util.js";

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

export const getUserProfile = async ({ userId }) => {
  const user = await User.findById(userId)
    .select("_id name email mobile credits profile_url")
    .lean();

  const defaultUserPlan = {
    purchasedCredits: 0,
    remainingCredits: 0,
    status: null,
    expiresAt: null,
    createdAt: null,
    planId: {
      code: "new",
    },
  };

  const userPlan = {
    ...defaultUserPlan,
    ...(await UserPlan.findOne({ userId })
      .select(
        "purchasedCredits remainingCredits status expiresAt createdAt planId",
      )
      .populate("planId", "code")
      .lean()),
  };

  const userUsage = (await UserUsage.findOne({ userId })
    .select("imagesGenerated videosGenerated creditsConsumed")
    .lean()) ?? {
    imagesGenerated: 0,
    videosGenerated: 0,
    creditsConsumed: 0,
  };

  return {
    user: user,
    plan: userPlan,
    usage: userUsage,
  };
};

export const updateProfilePhoto = async ({ userId, files }) => {
  const user = await User.findById(userId);
  const oldAvatar = user.profileImage;

  let avatarLocalPath;
  if (files && Array.isArray(files.avatar) && files.avatar.length > 0) {
    avatarLocalPath = files.avatar[0].path;
  }

  if (!avatarLocalPath) {
    throw new Error("Profile photo file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath, "PROFILE_PHOTO");
  if (!avatar) {
    throw new Error("Profile photo file is required");
  }

  user.avatar = avatar.url;
  await user.save();

  await UserLog.create({
    userId,
    action: "AVATAR_UPDATED",
    changes: [
      {
        field: "profileImage",
        oldValue: oldAvatar,
        newValue: profileImage,
      },
    ],
    ipAddress: req.ip,
    userAgent: req.get("User-Agent"),
    performedBy: userId,
  });

  return user;
};