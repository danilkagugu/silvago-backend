import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().min(3),
  description: Joi.string().min(3),
  price: Joi.number(),
  category: Joi.string(),
  subcategory: Joi.string(),
  image: Joi.string(),
});
