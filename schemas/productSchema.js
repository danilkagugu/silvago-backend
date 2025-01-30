import Joi from "joi";

export const createProductSchema = Joi.object({
  image: Joi.string(),
  category: Joi.string(),
  subcategory: Joi.string(),
  brand: Joi.string(),
  country: Joi.string(),
  description: Joi.string().min(3),
  price: Joi.number(),
  discount: Joi.number(),
});
