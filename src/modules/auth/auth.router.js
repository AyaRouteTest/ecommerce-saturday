import { Router } from "express";
import { isValid } from "./../../middleware/validation.middleware.js";
import {
  activateAccountSchema,
  forgetCodeSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "./auth.validation.js";
import {
  activateAccount,
  login,
  regitser,
  resetPassword,
  sendForgetCode,
} from "./auth.controller.js";
const router = Router();

// APIs
// Regitser
router.post("/register", isValid(registerSchema), regitser);

// Activate Account
router.get(
  "/confirmEmail/:activationCode",
  isValid(activateAccountSchema),
  activateAccount
);

// login
router.post("/login", isValid(loginSchema), login);

// send forget code
router.patch("/forgetCode", isValid(forgetCodeSchema), sendForgetCode);

// reset password
router.patch("/resetPassword", isValid(resetPasswordSchema), resetPassword);

export default router;
