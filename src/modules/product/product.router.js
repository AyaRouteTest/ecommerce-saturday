import { Router } from "express";
import { isAuthenticated } from "./../../middleware/authentication.middleware.js";
import { isAuthorized } from "./../../middleware/authorization.middleware.js";
import { fileUpload, fileValidationObj } from "../../utils/multer.js";
import {
  createProductSchema,
  deleteProductSchema,
} from "./product.validation.js";
import { isValid } from "../../middleware/validation.middleware.js";
import {
  createProduct,
  deleteProduct,
  allProducts,
  singleProduct,
} from "./product.controller.js";
const router = Router({ mergeParams: true });

// CRUD
// create product
router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(fileValidationObj.image).fields([
    { name: "defaultImage", maxCount: 1 },
    { name: "subImages", maxCount: 3 },
  ]),
  isValid(createProductSchema),
  createProduct
);

// delete product
router.delete(
  "/:productId",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(deleteProductSchema),
  deleteProduct
);

// read products
router.get("/", allProducts);

// read single product
router.get("/:productId", singleProduct);

export default router;
