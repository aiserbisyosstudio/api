import {
  registerUser,
} from '../services/user.service.js';

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};