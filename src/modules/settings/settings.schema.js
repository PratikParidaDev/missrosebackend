import Joi from 'joi';

export const updateSettingsSchema = Joi.object({
  siteName: Joi.string().max(100).required(),
  seoTitle: Joi.string().max(150).required(),
  seoDescription: Joi.string().max(300).required(),
  seoKeywords: Joi.string().required(),
  faviconUrl: Joi.string().allow('', null),
  googleAnalyticsId: Joi.string().allow('', null),
  facebookPixelId: Joi.string().allow('', null),
  primaryColor: Joi.string().allow('', null),
  accentColor: Joi.string().allow('', null)
});
