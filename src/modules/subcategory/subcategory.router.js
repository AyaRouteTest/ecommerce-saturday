import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { fileUpload, fileValidationObj } from "../../utils/multer.js";
import {
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  allSubcategories,
} from "./subcategory.controller.js";
import {
  createSubcategorySchema,
  deleteSubcategorySchema,
  updateSubcategorySchema,
} from "./subcategory.validation.js";
import { isValid } from "../../middleware/validation.middleware.js";
const router = Router({ mergeParams: true });

// CRUD
// create
router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(fileValidationObj.image).single("subcategory"),
  isValid(createSubcategorySchema),
  createSubcategory
);

// update
router.patch(
  "/:subcategoryId",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(fileValidationObj.image).single("subcategory"),
  isValid(updateSubcategorySchema),
  updateSubcategory
);

// delete
router.delete(
  "/:subcategoryId",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(deleteSubcategorySchema),
  deleteSubcategory
);

// read all subcategories
router.get("/", allSubcategories);
export default router;
