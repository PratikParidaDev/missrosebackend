import Joi from 'joi';

export const updateFooterSchema = Joi.object({
  copyrightText: Joi.string().required(),
  disclaimer: Joi.string().allow('', null),
  socialLinks: Joi.array().items(
    Joi.object({
      platform: Joi.string().required(),
      url: Joi.string().uri().required(),
      icon: Joi.string().required()
    })
  ).required(),
  quickLinks: Joi.array().items(
    Joi.object({
      label: Joi.string().required(),
      href: Joi.string().required()
    })
  ).required()
});
