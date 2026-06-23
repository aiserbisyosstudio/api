import {
  registerUser,
} from '../services/user.service.js';
import logger from '../config/logger.js';

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    logger.error(`${err.message}`);
    res.status(400).json({ success: false, message: err.message });
  }
};