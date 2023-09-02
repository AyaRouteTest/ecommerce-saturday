import { Router } from "express";
import { isAuthenticated } from "./../../middleware/authentication.middleware.js";
import { isValid } from "./../../middleware/validation.middleware.js";
import { isAuthorized } from "./../../middleware/authorization.middleware.js";
import {
  createCouponSchema,
  deleteCouponSchema,
  updateCouponSchema,
} from "./coupon.validation.js";
import {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  allCoupons,
} from "./coupon.controller.js";
const router = Router();

// CRUD
// create
router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(createCouponSchema),
  createCoupon
);

// update
router.patch(
  "/:code",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(updateCouponSchema),
  updateCoupon
);

// delete
router.delete(
  "/:code",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(deleteCouponSchema),
  deleteCoupon
);

// get all coupons
router.get("/", allCoupons);

export default router;
