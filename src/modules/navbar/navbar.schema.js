import Joi from 'joi';

export const updateNavbarSchema = Joi.object({
  logoUrl: Joi.string().allow('', null),
  logoText: Joi.string().max(100).allow('', null),
  ctaLabel: Joi.string().max(50).allow('', null),
  ctaLink: Joi.string().allow('', null),
  isSticky: Joi.boolean(),
  navLinks: Joi.alternatives().try(
    Joi.array().items(
      Joi.object({
        label: Joi.string().required(),
        href: Joi.string().required(),
        isExternal: Joi.boolean().default(false)
      })
    ),
    Joi.string() // stringified JSON
  ).required()
});
