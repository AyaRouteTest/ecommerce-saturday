import joi from "joi";
import { isObjectId } from "../../middleware/validation.middleware.js";

// create
export const createProductSchema = joi
  .object({
    name: joi.string().min(2).max(20).required(),
    description: joi.string(),
    availableItems: joi.number().min(1).required(),
    price: joi.number().min(1).required(),
    discount: joi.number().min(1).max(100),
    category: joi.string().custom(isObjectId).required(),
    subcategory: joi.string().custom(isObjectId).required(),
    brand: joi.string().custom(isObjectId).required(),
  })
  .required();

// delete
export const deleteProductSchema = joi
  .object({
    productId: joi.string().custom(isObjectId).required(),
  })
  .required();
