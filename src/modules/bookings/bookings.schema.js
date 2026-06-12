import Joi from 'joi';

export const createBookingSchema = Joi.object({
  clientName: Joi.string().min(2).max(100).required(),
  clientEmail: Joi.string().email().required(),
  clientPhone: Joi.string().required(),
  serviceId: Joi.number().integer().required(),
  preferredDate: Joi.date().iso().required(),
  preferredTime: Joi.string().required(),
  notes: Joi.string().allow('', null)
});

export const updateBookingStatusSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED').required(),
  adminNotes: Joi.string().allow('', null)
});
