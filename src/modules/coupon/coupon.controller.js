import { asyncHandler } from "../../utils/asyncHandler.js";
import voucher_codes from "voucher-code-generator";
import { Coupon } from "./../../../DB/models/coupon.model.js";

// create coupon
export const createCoupon = asyncHandler(async (req, res, next) => {
  // generate code
  const code = voucher_codes.generate({ length: 5 }); //[]

  // create coupon
  const coupon = await Coupon.create({
    name: code[0],
    discount: req.body.discount,
    expiredAt: new Date(req.body.expiredAt).getTime(), // 8/6/2023
    createdBy: req.user._id,
  });

  // response
  return res.status(201).json({ success: true, results: coupon });
});

// update coupon
export const updateCoupon = asyncHandler(async (req, res, next) => {
  // check coupon + coupon expired date
  const coupon = await Coupon.findOne({
    name: req.params.code,
    expiredAt: { $gt: Date.now() },
  });

  if (!coupon) return next(new Error("invalid coupon!"));

  // check owner
  if (req.user.id !== coupon.createdBy.toString())
    return next(new Error("not authorized!"));

  coupon.discount = req.body.discount ? req.body.discount : coupon.discount;
  coupon.expiredAt = req.body.expiredAt
    ? new Date(req.body.expiredAt).getTime()
    : coupon.expiredAt;

  await coupon.save();

  // response
  return res.json({
    success: true,
    results: coupon,
    message: "Coupon updated successfully!",
  });
});

// delete coupon
export const deleteCoupon = asyncHandler(async (req, res, next) => {
  // check coupon
  const coupon = await Coupon.findOne({
    name: req.params.code,
  });

  if (!coupon) return next(new Error("invalid coupon!"));

  // check owner
  if (req.user.id !== coupon.createdBy.toString())
    return next(new Error("not authorized!"));

  await Coupon.findOneAndDelete({ name: req.params.code });

  // response
  return res.json({ success: true, message: "Coupon deleted successfully!" });
});

// all coupons
export const allCoupons = asyncHandler(async (req, res, next) => {
  const coupons = await Coupon.find({});

  return res.json({ success: true, results: coupons });
});
