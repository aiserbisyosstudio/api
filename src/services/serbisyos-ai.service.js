import geminiAi from "../config/gemini.js";
import fs from "fs";
import env from "../config/environment.js";
import { cleanPrompt } from "../utils/prompt-utils.js";
import {
  crateUsagePlan,
  createGeneration,
  validateUserInput,
} from "../utils/utilities.util.js";
import Generation from "../models/generation.model.js";
import { Modality } from "@google/genai";

export const generateAiPrompt = async ({ prompt, userId }) => {
  let generation;
  try {
    const result = await validateUserInput(userId, prompt);
    if (result) {
      throw new Error(result);
    }

    const PROMPT_CREDIT_COST = 50;
    const userPlan = await crateUsagePlan(PROMPT_CREDIT_COST, userId);
    if (!userPlan) {
      throw new Error("Insufficient credits");
    }

    const clearedPrompt = cleanPrompt(prompt);

    const input = `
        You are an expert AI prompt engineer specializing in image generation.

        Rewrite the user's prompt into a rich, detailed prompt while preserving the original intent.

        Include:
        - subject
        - environment
        - lighting
        - composition
        - camera angle
        - artistic style
        - color palette
        - mood
        - level of detail
        - quality descriptors

        Do not add content that changes the user's intent.

        Return only the improved prompt.

        User Prompt:
        """${prompt}"""
        `;

    const startTime = Date.now();
    const response = await geminiAi.models.generateContent({
      model: env.GEMINI_PROMPT_MODEL,
      contents: input,
    });
    const endTime = Date.now();

    const generationTimeSeconds = Number(
      ((endTime - startTime) / 1000).toFixed(2),
    );

    generation = await createGeneration({
      userId,
      type: "prompt",
      operation: "create",
      prompt,
      creditsUsed: PROMPT_CREDIT_COST,
      model: env.GEMINI_PROMPT_MODEL,
      duration: generationTimeSeconds,
      usageData: {
        prompts: 1,
      },
    });

    const improvedPrompt = response.text;
    await Generation.updateGeneration(generation._id, {
      result: improvedPrompt,
      status: "completed",
    });

    return improvedPrompt;
  } catch (error) {
    if (generation) {
      await Generation.updateStatus(generation._id, "failed");
    }
    console.error(error);

    throw new Error("Failed to generate prompt");
  }
};

export const generateAiImage = async ({ prompt, userId }) => {
  let generation;
  try {
    const result = await validateUserInput(userId, prompt);
    if (result) {
      throw new Error(result);
    }

    const PROMPT_CREDIT_COST = 100;
    const userPlan = await crateUsagePlan(PROMPT_CREDIT_COST, userId);
    if (!userPlan) {
      throw new Error("Insufficient credits");
    }

    const clearedPrompt = cleanPrompt(prompt);

    const startTime = Date.now();
    const response = await geminiAi.models.generateContent({
      model: env.GEMINI_IMAGE_MODEL_FLASH,
      contents: clearedPrompt,
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
    const endTime = Date.now();

    const generationTimeSeconds = Number(
      ((endTime - startTime) / 1000).toFixed(2),
    );

    generation = await createGeneration({
      userId,
      type: "image",
      operation: "create",
      prompt: clearedPrompt,
      creditsUsed: PROMPT_CREDIT_COST,
      model: env.GEMINI_IMAGE_MODEL_FLASH,
      duration: generationTimeSeconds,
      usageData: {
        images: 1,
      },
    });

    const imagePart = response.candidates[0].content.parts.find(
      (part) => part.inlineData,
    );
    if (!imagePart) {
      throw new Error("No image returned from Gemini");
    }
    const { data: base64Image, mimeType } = imagePart.inlineData;
    return { base64Image, mimeType, generation };
  } catch (error) {
    if (generation) {
      await Generation.updateStatus(generation._id, "failed");
    }
    console.error(error);

    throw new Error("Failed to generate image");
  }
};