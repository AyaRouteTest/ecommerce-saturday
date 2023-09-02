import { asyncHandler } from "./../../utils/asyncHandler.js";
import { User } from "./../../../DB/models/user.model.js";
import bcryptjs from "bcryptjs";
import { nanoid } from "nanoid";
import { resetPassTemp, signUpTemp } from "./../../utils/htmlTemp.js";
import { sendEmail } from "./../../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import { Token } from "./../../../DB/models/token.model.js";
import { Cart } from "../../../DB/models/cart.model.js";

// register
export const regitser = asyncHandler(async (req, res, next) => {
  // data from request
  const { userName, email, password } = req.body;
  // check user existence
  const user = await User.findOne({ email });
  if (user) return next(new Error("Email already registered!"));
  // hash password
  const hashPassword = bcryptjs.hashSync(
    password,
    Number(process.env.SALT_ROUND)
  );
  // generate activationCode
  const activationCode = nanoid();
  // create user
  await User.create({
    email,
    userName,
    password: hashPassword,
    activationCode,
  });
  // create confirmationLink
  const url = `http://localhost:${process.env.PORT}/auth/confirmEmail/${activationCode}`;
  // send email
  const result = await sendEmail({
    to: email,
    subject: "Activate Account",
    html: signUpTemp(url),
  });

  // send response

  return result
    ? res.json({ success: true, message: "Please check your email!" })
    : next(new Error("Something went wrong!"));
});

// activate account
export const activateAccount = asyncHandler(async (req, res, next) => {
  const { activationCode } = req.params;
  // find user , delete the activationCode , update isConfirmed
  const user = await User.findOneAndUpdate(
    { activationCode },
    { isConfirmed: true, $unset: { activationCode: 1 } }
  );
  // check if the user doesn't exist
  if (!user) return next(new Error("User not found!", { cause: 404 }));

  // create a cart // TODO
  await Cart.create({ user: user._id });

  // send response
  return res.json({ success: true, message: "Please try to login!" });
});

// login
export const login = asyncHandler(async (req, res, next) => {
  // data from request
  const { email, password } = req.body;
  // check user existence
  const user = await User.findOne({ email });
  if (!user) return next(new Error("User not found!", { cause: 404 }));
  // check isConfirmed
  if (!user.isConfirmed)
    return next(new Error("Please activate your account!", { cause: 400 }));
  // check password
  const match = bcryptjs.compareSync(password, user.password);
  if (!match) return next(new Error("Invalid password!", { cause: 400 }));
  // generate token
  const token = jwt.sign(
    { email: user.email, id: user._id },
    process.env.TOKEN_KEY,
    { expiresIn: "2d" }
  );
  // save token in token model
  await Token.create({
    token,
    user: user._id,
    agent: req.headers["user-agent"],
    expiredAt: jwt.verify(token, process.env.TOKEN_KEY).exp,
  });
  // change user status to online and save user
  user.status = "online";
  await user.save();
  // send response
  return res.json({ succes: true, results: token });
});

// send forget code
export const sendForgetCode = asyncHandler(async (req, res, next) => {
  // data from request
  const { email } = req.body;
  // check user existence
  const user = await User.findOne({ email });
  if (!user) return next(new Error("User not found!", { cause: 404 }));
  // generate forgetCode
  const forgetCode = randomString.generate({
    charset: "numeric",
    length: 5,
  });

  // save forgetCode to user
  user.forgetCode = forgetCode;
  await user.save();
  // send email
  const result = await sendEmail({
    to: email,
    subject: "Reset Password",
    html: resetPassTemp(forgetCode),
  });
  // send response
  return result
    ? res.json({ success: true, message: "Check your email!" })
    : next(new Error("Something went wrong!"));
});

// reset password
export const resetPassword = asyncHandler(async (req, res, next) => {
  // data from request
  const { email, forgetCode, password } = req.body;
  // check user existence
  const user = await User.findOne({ email });
  if (!user) return next(new Error("User not found!", { cause: 404 }));
  // check forgetCode
  if (user.forgetCode !== forgetCode)
    return next(new Error("Invalid code!", { cause: 400 }));

  await User.findOneAndUpdate({ email }, { $unset: { forgetCode: 1 } });

  // hash password
  const hashPassword = bcryptjs.hashSync(
    password,
    Number(process.env.SALT_ROUND)
  );

  // update user
  user.password = hashPassword;
  await user.save();

  // invalidate token
  const tokens = await Token.find({ user: user._id });

  tokens.forEach(async (token) => {
    token.isValid = false;
    await token.save();
  });

  // response
  return res.json({ success: true, message: "Try to login!" });
});
