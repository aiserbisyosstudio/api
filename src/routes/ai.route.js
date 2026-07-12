import express from 'express';
import { generateAiPrompt, createAiImage } from "../controllers/ai.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post('/generate-prompt', authMiddleware, generateAiPrompt);
router.post('/create-image', authMiddleware, createAiImage);

export default router;