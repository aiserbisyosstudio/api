import mongoose from 'mongoose';

const generationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    type: {
      type: String,
      enum: ['image', 'video'],
      required: true,
    },

    prompt: {
      type: String,
      required: true,
    },

    resultUrl: {
      type: String,
      required: true,
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
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model('Generation', generationSchema);