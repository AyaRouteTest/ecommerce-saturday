import { Router } from "express";
import { isAuthenticated } from "./../../middleware/authentication.middleware.js";
import { isAuthorized } from "./../../middleware/authorization.middleware.js";
import { fileUpload, fileValidationObj } from "./../../utils/multer.js";
import { isValid } from "./../../middleware/validation.middleware.js";
import {
  createbrandSchema,
  deletebrandSchema,
  updatebrandSchema,
} from "./brand.validation.js";
import {
  createbrand,
  updatebrand,
  deletebrand,
  allBrands,
} from "./brand.controller.js";
const router = Router();

// CRUD
// create
// authentcation, authorization, files, validation
// multer ?
router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(fileValidationObj.image).single("brand"),
  isValid(createbrandSchema),
  createbrand
);

// update
router.patch(
  "/:brandId",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(fileValidationObj.image).single("brand"),
  isValid(updatebrandSchema),
  updatebrand
);

// delete
router.delete(
  "/:brandId",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(deletebrandSchema),
  deletebrand
);

// get read
router.get("/", allBrands);
export default router;
