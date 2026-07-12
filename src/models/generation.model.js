import mongoose from "mongoose";

const generationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["image", "video", "prompt"],
      required: true,
    },

    operation: {
      type: String,
      enum: ["create", "edit", "collage", "analyze"],
      required: true,
    },

    prompt: {
      type: String,
      required: true,
    },

    result: {
      type: String,
      default: "",
    },

    creditsUsed: {
      type: Number,
      required: true,
    },

    model: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

generationSchema.statics.createGeneration = async function (data) {
  return await this.create(data);
};

generationSchema.statics.updateGeneration = async function (
  generationId,
  updateData,
) {
  return await this.findByIdAndUpdate(
    generationId,
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    },
  );
};

generationSchema.statics.updateStatus = async function (generationId, status) {
  return await this.findByIdAndUpdate(
    generationId,
    { status },
    {
      new: true,
      runValidators: true,
    },
  );
};

export default mongoose.model("Generation", generationSchema);
