import express from 'express';
import { register, updateUserLanguage, updatePlan } from '../controllers/user.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/update-language', updateUserLanguage);
router.post('/update-plan', updatePlan);

export default router;