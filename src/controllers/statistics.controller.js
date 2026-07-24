import { getUserProfileStats } from "../services/statistics.service.js";

export const getProfileStats = async (req, res) => {
  try {
    const stats = await getUserProfileStats(req.body);
    res.status(201).json({ success: true, stats });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: err.message });
  }
};