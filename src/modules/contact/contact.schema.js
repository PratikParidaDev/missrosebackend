import Joi from 'joi';

export const updateContactInfoSchema = Joi.object({
  phone: Joi.string().required(),
  email: Joi.string().email().allow('', null),
  address: Joi.string().required(),
  businessHours: Joi.string().required(),
  mapEmbedUrl: Joi.string().uri().allow('', null),
  isActive: Joi.boolean()
});

export const createMessageSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow('', null),
  subject: Joi.string().max(200).required(),
  message: Joi.string().min(10).max(2000).required()
});
