import OpenAI from "openai";
import env from "../config/environment.js";
import { updateUserUsage } from "../controllers/usage.controller.js";
import UserPlan from "../models/user.plan.model.js";
import Generation from "../models/generation.model.js";
import { cleanPrompt } from "../utils/prompt-utils.js";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export const generatePrompt = async ({ prompt, userId }) => {
  let generation;
  try {
    if (!prompt) {
      throw new Error("Prompt is required.");
    }

    const PROMPT_CREDIT_COST = 50;

    const userPlan = await UserPlan.findOneAndUpdate(
      {
        userId,
        status: "active",
        expiresAt: { $gt: new Date() },
        remainingCredits: { $gte: PROMPT_CREDIT_COST },
      },
      {
        $inc: {
          remainingCredits: -PROMPT_CREDIT_COST,
        },
      },
      {
        new: true,
      },
    );

    if (!userPlan) {
      throw new Error("Insufficient credits");
    }

    generation = await Generation.createGeneration({
      userId,
      type: "prompt",
      operation: "create",
      prompt,
      result: "",
      creditsUsed: PROMPT_CREDIT_COST,
      model: env.GPT_CREATE_MODEL,
      status: "processing",
    });

    const clearedPrompt = cleanPrompt(prompt);
    const startTime = Date.now();
    const response = await openai.responses.create({
      model: env.GPT_CREATE_MODEL,
      input: `
        You are a world-class AI image prompt engineer.

        Transform the user's short idea into a highly detailed prompt optimized for modern text-to-image models.

        Include:
        - Subject
        - Environment
        - Composition
        - Camera angle
        - Lighting
        - Color palette
        - Mood
        - Artistic style
        - Rendering quality
        - Fine details

        Keep the prompt between 50 and 80 words.

        Return ONLY the prompt.

        User idea:
        ${clearedPrompt}
        `,
      max_output_tokens: 100,
      reasoning: {
        effort: "minimal",
      },
    });
    const endTime = Date.now();

    const generationTimeSeconds = Number(
      ((endTime - startTime) / 1000).toFixed(2),
    );

    await updateUserUsage({
      userId,
      prompts: 1,
      credits: PROMPT_CREDIT_COST,
      duration: generationTimeSeconds,
    });

    await Generation.updateGeneration(generation._id, {
      result: response.output_text,
      status: "completed",
    });

    return response.output_text;
  } catch (error) {
    if (generation) {
      await Generation.updateStatus(generation._id, "failed");
    }
    console.error(error);

    throw new Error("Failed to generate prompt");
  }
};

export const createImage = async ({ prompt, size, userId }) => {
  let generation;
  try {
    if (!prompt) {
      throw new Error("Prompt is required.");
    }

    const PROMPT_CREDIT_COST = 100;

    const userPlan = await UserPlan.findOneAndUpdate(
      {
        userId,
        status: "active",
        expiresAt: { $gt: new Date() },
        remainingCredits: { $gte: PROMPT_CREDIT_COST },
      },
      {
        $inc: {
          remainingCredits: -PROMPT_CREDIT_COST,
        },
      },
      {
        new: true,
      },
    );

    if (!userPlan) {
      throw new Error("Insufficient credits");
    }

    generation = await Generation.createGeneration({
      userId,
      type: "image",
      operation: "create",
      prompt,
      result: "",
      creditsUsed: PROMPT_CREDIT_COST,
      model: env.IMAGE_MINI_MODEL,
      status: "processing",
    });

    const clearedPrompt = cleanPrompt(prompt);
    const optimizedPrompt = `
      ${clearedPrompt}

      High quality digital artwork.
      Ultra detailed.
      Professional lighting.
      Sharp focus.
      Premium aesthetic.
      Vibrant colors.
      Realistic shadows.
      Modern composition.
      `;

    const startTime = Date.now();
    const response = await openai.images.generate({
      model: process.env.IMAGE_MINI_MODEL,
      prompt: optimizedPrompt.replace(/\n/g, " ").replace(/\s+/g, " ").trim(),
      size,
      quality: "medium",
    });

    if (
      !response ||
      !response.data ||
      !response.data[0] ||
      !response.data[0].b64_json
    ) {
      throw new Error("Failed to generate image");
    }

    const endTime = Date.now();

    const generationTimeSeconds = Number(
      ((endTime - startTime) / 1000).toFixed(2),
    );

    await updateUserUsage({
      userId,
      images: 1,
      credits: PROMPT_CREDIT_COST,
      duration: generationTimeSeconds,
    });

    return { generation, base64_json: response.data[0].b64_json };
  } catch (error) {
    if (generation) {
      await Generation.updateStatus(generation._id, "failed");
    }
    console.error(error);

    throw new Error("Failed to generate prompt");
  }
};