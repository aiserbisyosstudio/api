import express from 'express';
import { createPlan } from '../controllers/plan.controller.js';

const router = express.Router();

router.post('/create-new-plan', createPlan);

export default router;