import jwt from "jsonwebtoken";
import { User } from "./../../DB/models/user.model.js";
import { Token } from "./../../DB/models/token.model.js";
import { asyncHandler } from "./../utils/asyncHandler.js";

export const isAuthenticated = asyncHandler(async (req, res, next) => {
  // data
  let { token } = req.headers;
  if (!token || !token.startsWith(process.env.BEARER_KEY))
    return next(new Error("Valid token is reqiured!", { cause: 403 }));

  // verify
  token = token.split(process.env.BEARER_KEY)[1];
  const decoded = jwt.verify(token, process.env.TOKEN_KEY);
  if (!decoded) return next(new Error("Invalid token!"), { cause: 403 });

  // check user
  const { email } = decoded;
  const user = await User.findOne({ email });
  if (!user) return next(new Error("User not found!"), { cause: 404 });

  // check token
  const isValidToken = await Token.findOne({ token, isValid: true });
  if (!isValidToken) return next(new Error("Token expired!"), { cause: 404 });

  req.user = user;
  return next();
});
