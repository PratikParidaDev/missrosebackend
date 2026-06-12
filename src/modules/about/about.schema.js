import Joi from 'joi';

export const updateAboutSchema = Joi.object({
  sectionTitle: Joi.string().min(3).max(200).required(),
  sectionSubtitle: Joi.string().max(300).required(),
  psychicName: Joi.string().required(),
  designation: Joi.string().required(),
  bio: Joi.string().required(),
  profileImageUrl: Joi.string().allow('', null),
  yearsExperience: Joi.number().integer().min(0).required(),
  specialties: Joi.alternatives().try(
    Joi.array().items(Joi.string()).min(1),
    Joi.string() // in case it's sent as a single comma-separated string or stringified JSON
  ).required(),
  ctaLabel: Joi.string().allow('', null),
  ctaLink: Joi.string().allow('', null),
  isActive: Joi.boolean()
});
