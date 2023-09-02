import { asyncHandler } from "../../utils/asyncHandler.js";
import { Product } from "./../../../DB/models/product.model.js";
import { Cart } from "./../../../DB/models/cart.model.js";

// add to cart
export const addToCart = asyncHandler(async (req, res, next) => {
  // data
  const { productId, quantity } = req.body;

  // check product
  const product = await Product.findById(productId);
  if (!product) return next(new Error("Product not found!"));

  // check stock
  //   if (quantity > product.availableItems)
  if (!product.inStock(quantity))
    return next(
      new Error(
        `Sorry, only ${product.availableItems} items are left in the stock!`
      )
    );

  // add product to cart
  //   const cart = await Cart.findOne({ user: req.user._id });
  //   cart.products.push({ productId, quantity });
  //   await cart.save();

  // check if product exist in the cart
  // 1- find cart
  // 2- check product
  // 3- add to quantity

  const isPrdInCart = await Cart.findOne({
    user: req.user._id,
    "products.productId": productId,
  });

  if (isPrdInCart) {
    isPrdInCart.products.forEach((productObj) => {
      if (
        productObj.productId.toString() === productId.toString() &&
        productObj.quantity + quantity <= product.availableItems
      ) {
        productObj.quantity = productObj.quantity + quantity;
      }
    });
    await isPrdInCart.save();
    // response
    return res.json({ success: true, results: isPrdInCart });
  } else {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $push: { products: { productId, quantity } } },
      { new: true }
    );
    // response
    return res.json({ success: true, results: cart });
  }
});

// user cart
export const userCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "products.productId",
    "name price discount defaultImage.url finalPrice -_id"
  );
  return res.json({ success: true, results: cart });
});

// update cart
export const updateCart = asyncHandler(async (req, res, next) => {
  // data
  const { productId, quantity } = req.body;

  // check product
  const product = await Product.findById(productId);
  if (!product) return next(new Error("Product not found!"));

  // check stock
  //   if (quantity > product.availableItems)
  if (!product.inStock(quantity))
    return next(
      new Error(
        `Sorry, only ${product.availableItems} items are left in the stock!`
      )
    );

  // update
  const cart = await Cart.findOneAndUpdate(
    {
      user: req.user._id,
      "products.productId": productId,
    },
    {
      $set: { "products.$.quantity": quantity },
    },
    { new: true }
  );

  // response
  return res.json({
    success: true,
    results: cart,
    message: "Cart updated successfully!",
  });
});

// remove product from cart
export const removeProductFromCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { products: { productId: req.params.productId } } },
    { new: true }
  );

  return res.json({
    success: true,
    results: cart,
    message: "Product removed successfully!",
  });
});

// clear cart
export const clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { products: [] },
    { new: true }
  );

  return res.json({ success: true, results: cart });
});
