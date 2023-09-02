import joi from "joi";
import { Types } from "mongoose";
import { isObjectId } from "./../../middleware/validation.middleware.js";

// create
export const createCategorySchema = joi
  .object({
    name: joi.string().required(),
  })
  .required();

// update
export const updateCategorySchema = joi
  .object({
    name: joi.string(),
    categoryId: joi.string().custom(isObjectId).required(), // objectId
  })
  .required();

// delete
export const deleteCategorySchema = joi
  .object({
    categoryId: joi.string().custom(isObjectId).required(), // objectId
  })
  .required();
