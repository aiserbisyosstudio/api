import { generatePrompt, createImage } from "../services/ai.service.js";
import Generation from "../models/generation.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.util.js";

export const generateAiPrompt = async (req, res) => {
  try {
    const prompt = await generatePrompt(req.body);
    res.status(201).json({
      success: true,
      message: "Prompt generated successfully",
      prompt,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const createAiImage = async (req, res) => {
  let generation;
  try {
    const response = await createImage(req.body);
    generation = response.generation;

    const imageFile = `data:image/png;base64,${response.base64_json}`;
    const aiImage = await uploadOnCloudinary(imageFile, "IMAGES");
    const image_url = aiImage.url;

    await Generation.updateGeneration(generation._id, {
      result: image_url,
      status: "completed",
    });

    res.status(201).json({
      success: true,
      message: "Image created successfully",
      image_url,
    });
  } catch (err) {
    console.log(err);
    if (generation) {
      await Generation.updateStatus(generation._id, "failed");
    }
    res.status(400).json({ success: false, message: err.message });
  }
};