import { Types } from "mongoose";

// custom function to validate id
export const isObjectId = (value, helper) => {
  // mongoose
  if (Types.ObjectId.isValid(value)) return true;
  return helper.message("Invalid objectid!");
};

export const isValid = (schema) => {
  return (req, res, next) => {
    // data
    const copyReq = { ...req.body, ...req.params, ...req.query };

    // validate
    const validationResult = schema.validate(copyReq, { abortEarly: false });

    // check for errors
    if (validationResult.error) {
      const errorMessages = validationResult.error.details.map(
        (errorObj) => errorObj.message
      );

      return next(new Error(errorMessages, { cause: 400 }));
    }

    return next();
  };
};
