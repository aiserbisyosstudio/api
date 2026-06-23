import User from '../models/user.model.js';
import logger from '../config/logger.js';
import bcrypt from "bcryptjs";

export const registerUser = async ({ name, email, mobile, password }) => {
  if (
    [name, email, mobile, password].some((field) => field?.trim() === '')
  ) {
    logger.error('Register user: All fields are required');
    throw new Error('All fields are required');
  }

  logger.info(`Register user: ${name, email, mobile, password}`);

  const exists = await User.findOne({ $or: [{ mobile }, { email }] });
  if (exists) {
    logger.error('Register user: User already exists');
    throw new Error('User already exists')
  };

  const user = await User.create({ name, email, mobile, password });

  logger.info(`User registered successfully`);
  logger.info(`Registered user: ${user}`);
  return user;
};