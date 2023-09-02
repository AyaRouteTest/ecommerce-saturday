import joi from "joi";
import { Types } from "mongoose";
import { isObjectId } from "./../../middleware/validation.middleware.js";

// create
export const createbrandSchema = joi
  .object({
    name: joi.string().required(),
  })
  .required();

// update
export const updatebrandSchema = joi
  .object({
    name: joi.string(),
    brandId: joi.string().custom(isObjectId).required(), // objectId
  })
  .required();

// delete
export const deletebrandSchema = joi
  .object({
    brandId: joi.string().custom(isObjectId).required(), // objectId
  })
  .required();
