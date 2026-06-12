import Joi from 'joi';

export const createTestimonialSchema = Joi.object({
  clientName: Joi.string().min(2).max(100).required(),
  clientAvatarUrl: Joi.string().allow('', null),
  rating: Joi.number().integer().min(1).max(5).required(),
  review: Joi.string().min(10).required(),
  isApproved: Joi.boolean().default(false),
  isFeatured: Joi.boolean().default(false)
});

export const updateTestimonialSchema = createTestimonialSchema.fork(
  ['clientName', 'rating', 'review'],
  (schema) => schema.optional()
);
