import { Router } from "express";
import { isAuthenticated } from "./../../middleware/authentication.middleware.js";
import { isAuthorized } from "./../../middleware/authorization.middleware.js";
import { fileUpload, fileValidationObj } from "./../../utils/multer.js";
import { isValid } from "./../../middleware/validation.middleware.js";
import {
  createCategorySchema,
  deleteCategorySchema,
  updateCategorySchema,
} from "./category.validation.js";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  allCategories,
} from "./category.controller.js";
import subcategoryRouter from "./../subcategory/subcategory.router.js";
import productRouter from "./../product/product.router.js";
const router = Router();

router.use("/:categoryId/subcategory", subcategoryRouter);
router.use("/:categoryId/products", productRouter);

// CRUD
// create
// authentcation, authorization, files, validation
// multer ?
router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(fileValidationObj.image).single("category"),
  isValid(createCategorySchema),
  createCategory
);

// update
router.patch(
  "/:categoryId",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(fileValidationObj.image).single("category"),
  isValid(updateCategorySchema),
  updateCategory
);

// delete
router.delete(
  "/:categoryId",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(deleteCategorySchema),
  deleteCategory
);

// get read
router.get("/", allCategories);
export default router;
