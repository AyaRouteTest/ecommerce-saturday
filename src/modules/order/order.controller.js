import { asyncHandler } from "../../utils/asyncHandler.js";
import { Coupon } from "./../../../DB/models/coupon.model.js";
import { Cart } from "./../../../DB/models/cart.model.js";
import { Product } from "./../../../DB/models/product.model.js";
import { Order } from "./../../../DB/models/order.model.js";
import path from "path";
import { clearCart, updateStock } from "./order.service.js";
import { createInvoice } from "./../../utils/createInvoice.js";
import { fileURLToPath } from "url";
import { sendEmail } from "./../../utils/sendEmail.js";
import cloudinary from "./../../utils/cloud.js";
import Stripe from "stripe";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// create order
export const createOrder = asyncHandler(async (req, res, next) => {
  // data
  const { payment, coupon, address, phone } = req.body;

  // check coupon
  let checkCoupon;
  if (coupon) {
    checkCoupon = await Coupon.findOne({
      name: coupon,
      expiredAt: { $gt: Date.now() },
    });

    if (!checkCoupon) return next(new Error("Invalid Coupon!"));
  }

  // products existence in cart
  const cart = await Cart.findOne({ user: req.user._id });
  const products = cart.products;
  if (products.length < 1) return next(new Error("Cart is empty!"));

  let orderProducts = [];
  let orderPrice = 0;

  // check products and stock
  for (let i = 0; i < products.length; i++) {
    const product = await Product.findById(products[i].productId);
    if (!product) return next(new Error(`product ${product._id} not found!`));

    // check stock
    if (!product.inStock(products[i].quantity))
      return next(
        new Error(
          `Sorry, product ${product.name} only ${product.availableItems} are left in stock`
        )
      );

    orderProducts.push({
      productId: product._id,
      name: product.name,
      quantity: products[i].quantity,
      itemPrice: product.finalPrice,
      totalPrice: products[i].quantity * product.finalPrice,
    });

    orderPrice += product.finalPrice * products[i].quantity;
  }

  // add data to order
  const order = await Order.create({
    user: req.user._id,
    products: orderProducts,
    price: orderPrice,
    address,
    phone,
    payment,
    coupon: {
      id: checkCoupon?._id,
      name: checkCoupon?.name,
      discount: checkCoupon?.discount,
    },
  });

  // invoice pdf
  const user = req.user;
  const invoice = {
    shipping: {
      name: user.userName,
      address: order.address,
      country: "Egypt",
    },
    items: order.products,
    subtotal: order.price,
    paid: order.finalPrice,
    invoice_nr: order._id,
  };

  const pdfPath = path.join(
    __dirname,
    `./../../../invoiceTemp/${order._id}.pdf`
  );

  createInvoice(invoice, pdfPath); // file system

  // upload invoice on cloudinary
  const { secure_url, public_id } = await cloudinary.uploader.upload(pdfPath, {
    folder: `${process.env.CLOUD_ROOT_FOLDER}/order/${user._id}/invoice`,
  });

  // delete invoice from system // TODO

  order.invoice = { id: public_id, url: secure_url };
  await order.save();

  // send email to user
  const isSent = await sendEmail({
    to: user.email,
    subject: "Order invoice",
    attachments: [{ path: secure_url, contentType: "application/pdf" }],
  });

  if (isSent) {
    // clear cart
    clearCart(req.user._id);

    // update stock
    updateStock(order.products, true);
  }

  if (payment === "visa") {
    const stripe = new Stripe(process.env.STRIPE_KEY);
    // check coupon
    let couponExist;
    if (order.coupon.name !== undefined) {
      couponExist = await stripe.coupons.create({
        percent_off: order.coupon.discount,
      });
    }

    // checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      metadata: {
        order_id: order._id.toString(),
      },
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
      line_items: order.products.map((product) => {
        return {
          price_data: {
            currency: "egp",
            product_data: {
              name: product.name,
            },
            unit_amount: product.itemPrice * 100,
          },
          quantity: product.quantity,
        };
      }),
      discounts: couponExist ? [{ coupon: couponExist.id }] : [], //
    });

    return res.json({ success: true, results: session.url });
  }

  return res.json({
    success: true,
    message: "Order placed successfully, check you email!",
  });
});

// cancel order
export const cancelOrder = asyncHandler(async (req, res, next) => {
  // order
  const order = await Order.findById(req.params.orderId);
  if (!order) return next(new Error("Order not found!"));

  if (order.status === "shipped" || order.status === "delivered")
    return next(new Error("can not cancel order!"));

  order.status = "canceled";
  await order.save();

  // update stock
  updateStock(order.products, false);

  return res.json({ success: true, message: "Order canceled successfully!" });
});

//webhook
export const webhook = asyncHandler(async (request, response) => {
  const stripe = new Stripe(process.env.STRIPE_KEY);
  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env.ENDPOINT_SECRET
    );
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  const orderId = event.data.object.metadata.order_id;
  if (event.type === "checkout.session.completed") {
    // clear cart
    // update stock
    await Order.findOneAndUpdate({ _id: orderId }, { status: "payed" });
    return;
  }

  await Order.findOneAndUpdate(
    { _id: orderId },
    {
      status: "failed to pay",
    }
  );

  return;
});
