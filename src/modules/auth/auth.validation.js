import joi from "joi";

// regitser schema
export const registerSchema = joi
  .object({
    email: joi.string().email().required(),
    password: joi.string().required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
    userName: joi.string().required().min(5).max(20),
  })
  .required();

// activate account
export const activateAccountSchema = joi
  .object({
    activationCode: joi.string().required(),
  })
  .required();

// login schema
export const loginSchema = joi
  .object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  })
  .required();

// send forgetCode schema
export const forgetCodeSchema = joi
  .object({
    email: joi.string().email().required(),
  })
  .required();

// resetPassword schema
export const resetPasswordSchema = joi
  .object({
    email: joi.string().email().required(),
    password: joi.string().required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
    forgetCode: joi.string().length(5).required(),
  })
  .required();
