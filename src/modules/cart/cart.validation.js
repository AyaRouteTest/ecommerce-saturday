import joi from "joi";
import { isObjectId } from "../../middleware/validation.middleware.js";

// add to cart + update cart
export const cartSchema = joi
  .object({
    productId: joi.string().custom(isObjectId).required(),
    quantity: joi.number().integer().min(1).required(),
  })
  .required();

export const removeProductSchema = joi
  .object({
    productId: joi.string().custom(isObjectId).required(),
  })
  .required();
