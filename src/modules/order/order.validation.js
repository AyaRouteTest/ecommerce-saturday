import joi from "joi";
import { isObjectId } from "../../middleware/validation.middleware.js";

export const createOrderSchema = joi
  .object({
    phone: joi.string().required().length(11),
    address: joi.string().min(10).required(),
    payment: joi.string().valid("cash", "visa"),
    coupon: joi.string(),
  })
  .required();

export const cancelOrderSchema = joi
  .object({
    orderId: joi.string().custom(isObjectId).required(),
  })
  .required();
