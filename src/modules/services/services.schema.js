import Joi from 'joi';

export const createServiceSchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  slug: Joi.string().pattern(/^[a-z0-9-]+$/).required(),
  shortDescription: Joi.string().max(300).required(),
  longDescription: Joi.string().allow('', null),
  imageUrl: Joi.string().allow('', null),
  iconName: Joi.string().allow('', null),
  price: Joi.number().positive().allow(null),
  duration: Joi.string().allow('', null),
  sessionType: Joi.string().valid('IN_PERSON', 'ONLINE', 'BOTH').required(),
  isFeatured: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true),
  sortOrder: Joi.number().integer().default(0)
});

export const updateServiceSchema = createServiceSchema.fork(
  ['title', 'slug', 'shortDescription', 'sessionType'],
  (schema) => schema.optional()
);
