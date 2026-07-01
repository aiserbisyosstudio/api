import express from 'express';
import { login, logout, updatePassword, sendOtp, verifyEmailOTP } from '../controllers/auth.controller.js'; 

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/update-password', updatePassword);
router.post('/send-email-otp', sendOtp);
router.post('/verify-email-otp', verifyEmailOTP);

export default router;