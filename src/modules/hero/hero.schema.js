import Joi from 'joi';

export const updateHeroSchema = Joi.object({
  headline: Joi.string().min(3).max(200).required(),
  subheadline: Joi.string().max(500).required(),
  backgroundImageUrl: Joi.string().allow('', null),
  ctaPrimaryLabel: Joi.string().max(50).allow('', null),
  ctaPrimaryLink: Joi.string().allow('', null),
  ctaSecondaryLabel: Joi.string().max(50).allow('', null),
  ctaSecondaryLink: Joi.string().allow('', null),
  badgeText: Joi.string().max(100).allow('', null),
  isActive: Joi.boolean()
});
