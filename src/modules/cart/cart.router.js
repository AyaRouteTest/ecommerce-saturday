import { Router } from "express";
import { isValid } from "./../../middleware/validation.middleware.js";
import { isAuthenticated } from "./../../middleware/authentication.middleware.js";
import { cartSchema, removeProductSchema } from "./cart.validation.js";
import {
  addToCart,
  userCart,
  updateCart,
  removeProductFromCart,
  clearCart,
} from "./cart.controller.js";
const router = Router();

// CRUD
// add product to cart
router.post("/", isAuthenticated, isValid(cartSchema), addToCart);

// user cart
router.get("/", isAuthenticated, userCart);

// update cart
router.patch("/", isAuthenticated, isValid(cartSchema), updateCart);

// clear cart
router.patch("/clear", isAuthenticated, clearCart);

// remove product from cart
router.patch(
  "/:productId", // localhost:3000/cart/clear
  isAuthenticated,
  isValid(removeProductSchema),
  removeProductFromCart
);

export default router;
