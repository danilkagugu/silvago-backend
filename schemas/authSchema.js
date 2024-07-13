import Joi from "joi";

export const updateSchema = Joi.object({
  name: Joi.string().min(3),
  serName: Joi.string().min(3),
  phone: Joi.number(),
  email: Joi.string(),
  area: Joi.string().optional(),
  city: Joi.string().optional(),
  office: Joi.string().optional(),
});
