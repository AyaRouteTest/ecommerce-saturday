import { Cart } from "../../../DB/models/cart.model.js";
import { Product } from "../../../DB/models/product.model.js";

// clear cart
export const clearCart = async (userId) => {
  await Cart.findOneAndUpdate({ user: userId }, { products: [] });
};

// update stock
export const updateStock = async (products, placeOrder) => {
  // placeOrder >>> boolean
  // true >>> place order
  // false >>> cancel order
  if (placeOrder) {
    for (const product of products) {
      await Product.findByIdAndUpdate(product.productId, {
        $inc: {
          soldItems: product.quantity,
          availableItems: -product.quantity,
        },
      });
    }
  } else {
    for (const product of products) {
      await Product.findByIdAndUpdate(product.productId, {
        $inc: {
          soldItems: -product.quantity,
          availableItems: product.quantity,
        },
      });
    }
  }
};
