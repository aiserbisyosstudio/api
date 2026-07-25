import express from 'express';
import { generatePrompt, generateImage, editImage, createImageCollage } from "../controllers/serbisyos-ai.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post('/generate-prompt', authMiddleware, generatePrompt);
router.post('/generate-image', authMiddleware, generateImage);
router.route("/edit-image").post(upload.fields([{ name: "image", maxCount: 1,}]), authMiddleware, editImage);
router.route("/create-image-collage").post(upload.fields([{ name: "images", maxCount: 10,}]), authMiddleware, createImageCollage);

export default router;