import { asyncHandler } from "./../../utils/asyncHandler.js";
import cloudinary from "./../../utils/cloud.js";
import slugify from "slugify";
import { Subcategory } from "./../../../DB/models/subcategory.model.js";
import { Category } from "./../../../DB/models/category.model.js";

// create
export const createSubcategory = asyncHandler(async (req, res, next) => {
  // data
  const { name } = req.body;

  // file
  if (!req.file)
    return next(new Error("category image is required!", { cause: 400 }));

  const slug = slugify(name);

  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.CLOUD_ROOT_FOLDER}/subcategory`,
    }
  );

  // create
  const subcategory = await Subcategory.create({
    name,
    slug,
    image: { id: public_id, url: secure_url },
    createdBy: req.user._id,
    categoryId: req.params.categoryId,
  });

  // responce
  return res.status(201).json({ success: true, results: subcategory });
});

// update
export const updateSubcategory = asyncHandler(async (req, res, next) => {
  //check catgeory
  const category = await Category.findById(req.params.categoryId);
  if (!category) return next(new Error("category not found!", { cause: 404 }));

  //check subcategory
  const subcategory = await Subcategory.findOne({
    _id: req.params.subcategoryId,
    categoryId: req.params.categoryId,
  });
  if (!subcategory)
    return next(new Error("subcategory not found!", { cause: 404 }));

  // check owner
  if (req.user.id != subcategory.createdBy.toString())
    return next(new Error("you are not the owner!", { cause: 401 }));

  // data
  if (req.file) {
    const { secure_url } = await cloudinary.uploader.upload(req.file.path, {
      public_id: subcategory.image.id,
    });
    subcategory.image.url = secure_url;
  }

  subcategory.name = req.body.name ? req.body.name : subcategory.name;
  subcategory.slug = req.body.name ? slugify(req.body.name) : subcategory.slug;

  await subcategory.save();

  return res.json({
    success: true,
    message: "subcategory updated successfully!",
    results: subcategory,
  });
});

// delete
export const deleteSubcategory = asyncHandler(async (req, res, next) => {
  //check catgeory
  const category = await Category.findById(req.params.categoryId);
  if (!category) return next(new Error("category not found!", { cause: 404 }));

  //check subcategory
  const subcategory = await Subcategory.findOne({
    _id: req.params.subcategoryId,
    categoryId: req.params.categoryId,
  });
  if (!subcategory)
    return next(new Error("subcategory not found!", { cause: 404 }));

  // check owner
  if (req.user.id != subcategory.createdBy.toString())
    return next(new Error("you are not the owner!", { cause: 401 }));

  // delete image
  await cloudinary.uploader.destroy(subcategory.image.id);

  // delete subcategory
  await Subcategory.findByIdAndDelete(req.params.subcategoryId);

  return res.json({
    success: true,
    message: "subcategory deleted successfully!",
  });
});

// all subcategories
export const allSubcategories = asyncHandler(async (req, res, next) => {
  const subcategories = await Subcategory.find({}).populate("categoryId");
  return res.json({ success: true, results: subcategories });
});
