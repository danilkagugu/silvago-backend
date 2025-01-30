import Joi from "joi";

export const updateSchema = Joi.object({
  firstName: Joi.string().min(3),
  lastName: Joi.string().min(3),
  middleName: Joi.string().min(3),
  phone: Joi.string(),
  email: Joi.string(),
  city: Joi.string().optional(),
});
