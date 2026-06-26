import {
  createNewContact,
} from '../services/contact.service.js';
import logger from '../config/logger.js';

export const newContact = async (req, res) => {
  try {
    const contact = await createNewContact(req.body);
    res.status(201).json({ success: true, message: 'Contact message sent successfully' });
  } catch (err) {
    logger.error(`${err.message}`);
    res.status(400).json({ success: false, message: err.message });
  }
};