import { asyncHandler } from "./../../utils/asyncHandler.js";
import { Category } from "./../../../DB/models/category.model.js";
import cloudinary from "./../../utils/cloud.js";
import slugify from "slugify";

// create
export const createCategory = asyncHandler(async (req, res, next) => {
  // data
  const { name } = req.body;

  // file
  if (!req.file)
    return next(new Error("category image is required!", { cause: 400 }));

  const slug = slugify(name);

  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.CLOUD_ROOT_FOLDER}/category`,
    }
  );

  // create
  const category = await Category.create({
    name,
    slug,
    image: { id: public_id, url: secure_url },
    createdBy: req.user._id,
  });

  // responce
  return res.status(201).json({ success: true, results: category });
});

// update
export const updateCategory = asyncHandler(async (req, res, next) => {
  // check category
  const category = await Category.findById(req.params.categoryId); // category owner
  if (!category) return next(new Error("Category not found!", { cause: 404 }));

  // check owner
  if (req.user._id !== category.createdBy)
    return next(new Error("Not authorized!", { cause: 401 }));

  // file
  if (req.file) {
    const { secure_url } = await cloudinary.uploader.upload(req.file.path, {
      folder: `${process.env.CLOUD_ROOT_FOLDER}/category`,
      public_id: category.image.id,
    });
    category.image.url = secure_url;
  }

  // name
  category.name = req.body.name ? req.body.name : category.name;
  category.slug = req.body.name ? slugify(req.body.name) : category.slug;

  await category.save();
  // response
  return res.status(201).json({ success: true, results: category });
});

// delete
export const deleteCategory = asyncHandler(async (req, res, next) => {
  // check category
  const category = await Category.findById(req.params.categoryId); // category owner
  if (!category) return next(new Error("Category not found!", { cause: 404 }));

  // check owner
  // if (req.user.id.equals(category.createdBy))
  if (req.user._id.toString() != category.createdBy.toString())
    return next(new Error("Not authorized!", { cause: 401 }));

  // delete category
  const results = await cloudinary.uploader.destroy(category.image.id);
  console.log(results);

  if (results.result === "ok") {
    await Category.findByIdAndDelete(req.params.categoryId);
  }

  // response
  return res.json({ success: true, message: "category deleted successully!" });
});

// get all categories
export const allCategories = asyncHandler(async (req, res, next) => {
  // find
  const categories = await Category.find({}).populate([
    {
      path: "subcategory",
      select: "name createdBy -_id",
      populate: { path: "createdBy", select: "userName -_id" },
    },
    { path: "createdBy", select: "userName" },
  ]);
  return res.json({ success: true, results: categories });
});
