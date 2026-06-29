import {
  registerUser,
  updateLanguage,
  updateUserPlan,
  getUserProfile,
  updateProfilePhoto,
} from '../services/user.service.js';

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateUserLanguage = async (req, res) => {
  try {
    await updateLanguage(req.body);
    res.status(201).json({ success: true, message: 'Selected language saved successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const userPlan = await updateUserPlan(req.body);
    res.status(201).json({ userPlan, success: true, message: 'Plan activate successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const profile = await getUserProfile(req.body);
    res.status(201).json({ profile, success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export const updatePhoto = async (req, res) => {
  try {
    const user = await getUserProfile(req.body, req.files);
    res.status(201).json({ success: true, message: "Profile photo updated successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message, user });
  }
}