import User from '../models/user.model.js';
import bcrypt from "bcryptjs";

export const registerUser = async ({ name, email, mobile, password }) => {
  if (
    [name, email, mobile, password].some((field) => field?.trim() === '')
  ) {
    throw new Error('All fields are required');
  }

  logger.info(`Register user: ${name, email, mobile, password}`);

  const exists = await User.findOne({ $or: [{ mobile }, { email }] });
  if (exists) {
    throw new Error('User already exists')
  };

  const user = await User.create({ name, email, mobile, password });

  return user;
};