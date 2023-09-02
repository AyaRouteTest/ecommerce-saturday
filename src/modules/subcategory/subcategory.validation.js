import { isObjectId } from "./../../middleware/validation.middleware.js";
import joi from "joi";
// create
export const createSubcategorySchema = joi
  .object({
    name: joi.string().required(),
    categoryId: joi.string().custom(isObjectId).required(),
  })
  .required();

// update
export const updateSubcategorySchema = joi
  .object({
    name: joi.string(),
    categoryId: joi.string().custom(isObjectId).required(),
    subcategoryId: joi.string().custom(isObjectId).required(),
  })
  .required();

// update
export const deleteSubcategorySchema = joi
  .object({
    categoryId: joi.string().custom(isObjectId).required(),
    subcategoryId: joi.string().custom(isObjectId).required(),
  })
  .required();
