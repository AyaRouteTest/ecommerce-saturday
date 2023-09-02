import { Router } from "express";
import { isValid } from "./../../middleware/validation.middleware.js";
import { isAuthenticated } from "./../../middleware/authentication.middleware.js";
import { cancelOrderSchema, createOrderSchema } from "./order.validation.js";
import { createOrder, cancelOrder, webhook } from "./order.controller.js";
import express from "express";
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

router.post("/webhook", express.raw({ type: "application/json" }), webhook);

export default router;
