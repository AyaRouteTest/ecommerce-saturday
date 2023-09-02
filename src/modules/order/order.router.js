import { Router } from "express";
import { isValid } from "./../../middleware/validation.middleware.js";
import { isAuthenticated } from "./../../middleware/authentication.middleware.js";
import { cancelOrderSchema, createOrderSchema } from "./order.validation.js";
import { createOrder, cancelOrder } from "./order.controller.js";
const router = Router();

// create order
router.post("/", isAuthenticated, isValid(createOrderSchema), createOrder);

// cancel order
router.patch(
  "/:orderId",
  isAuthenticated,
  isValid(cancelOrderSchema),
  cancelOrder
);

export default router;
