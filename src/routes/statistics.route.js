import express from 'express';
import { getProfileStats } from '../controllers/statistics.controller.js';
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post('/get-profile-stats', authMiddleware, getProfileStats);

export default router;