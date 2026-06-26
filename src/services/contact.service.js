import Contact from "../models/contact.model.js";
import logger from "../config/logger.js";

const createNewContact = async ({ name, email, mobile, subject, message }) => {
  if (
    [name, email, mobile, subject, message].some(
      (field) => field?.trim() === "",
    )
  ) {
    logger.error("Contact message: All fields are required");
    throw new Error("All fields are required");
  }

  const contact = await Contact.create({ name, email, mobile, subject, message });

  if (!contact) {
    logger.error("Contact message: Failed to send message");
    throw new Error("Contact message: Failed to send message");
  }

  logger.info(`Contact message saved successfully`);
  logger.info(`Contact message: ${contact}`);
  return contact;
};

export { createNewContact };