import authRouter from "./modules/auth/auth.router.js";
import categoryRouter from "./modules/category/category.router.js";
import subcategoryRouter from "./modules/subcategory/subcategory.router.js";
import brandRouter from "./modules/brand/brand.router.js";
import productRouter from "./modules/product/product.router.js";
import couponRouter from "./modules/coupon/coupon.router.js";
import cartRouter from "./modules/cart/cart.router.js";
import orderRouter from "./modules/order/order.router.js";
import morgan from "morgan";
import cors from "cors";
export const appRouter = (app, express) => {
  // morgan
  if (process.env.NODE_ENV === "dev") {
    app.use(morgan("combined"));
  }

  // const whitelist = ["http://127.0.0.1:5500"];
  // app.use((req, res, next) => {
  //   if (req.originalUrl.includes("/auth/confirmEmail")) {
  //     res.setHeader("Access-Control-Allow-Origin", "*");
  //     res.setHeader("Access-Control-Allow-Methods", "GET");
  //     return next();
  //   }

  //   if (!whitelist.includes(req.header("origin")))
  //     return next(new Error("Blocked by CORS!"));

  //   res.setHeader("Access-Control-Allow-Origin", "*");
  //   res.setHeader("Access-Control-Allow-Headers", "*");
  //   res.setHeader("Access-Control-Allow-Methods", "*");
  //   res.setHeader("Access-Control-Allow-Private-Networks", true);

  //   return next();
  // });

  app.use(cors()); // allow all origins

  // global middleware
  app.use((req, res, next) => {
    if (req.originalUrl.includes("/order/webhook")) {
      return next();
    }
    express.json()(req, res, next);
  });

  // Routes
  // auth
  app.use("/auth", authRouter);

  // category
  app.use("/category", categoryRouter);

  // subcategory
  app.use("/subcategory", subcategoryRouter);

  // brand
  app.use("/brand", brandRouter);

  // product
  app.use("/product", productRouter);

  // coupon
  app.use("/coupon", couponRouter);

  // cart
  app.use("/cart", cartRouter);

  // order
  app.use("/order", orderRouter);

  // not found pages
  app.all("*", (req, res, next) => {
    return next(new Error("Page not found!", { cause: 404 }));
  });

  // global error handler
  app.use((error, req, res, next) => {
    return res.status(error.cause || 500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  });
};
