import Generation from "../models/generation.model.js";
import mongoose from "mongoose";

export const getUserProfileStats = async ({ userId }) => {
  if (!userId?.trim()) {
    return "Unauthorized access.";
  }

  const stats = await Generation.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        status: "completed",
      },
    },
    {
      $group: {
        _id: {
          type: "$type",
          operation: "$operation",
        },
        count: {
          $sum: 1,
        },
      },
    },
  ]);
  return stats;
};