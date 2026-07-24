import express from 'express';
import { generatePrompt, generateImage } from "../controllers/serbisyos-ai.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post('/generate-prompt', authMiddleware, generatePrompt);
router.post('/generate-image', authMiddleware, generateImage);

export default router;