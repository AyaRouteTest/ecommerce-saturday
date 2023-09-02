import { asyncHandler } from "../../utils/asyncHandler.js";
import { Subcategory } from "./../../../DB/models/subcategory.model.js";
import { Category } from "./../../../DB/models/category.model.js";
import { Brand } from "./../../../DB/models/brand.model.js";
import cloudinary from "./../../utils/cloud.js";
import { Product } from "./../../../DB/models/product.model.js";
import { nanoid } from "nanoid";

// create
export const createProduct = asyncHandler(async (req, res, next) => {
  // data
  //   const {
  //     name,
  //     description,
  //     price,
  //     discount,
  //     availableItems,
  //     catgeory,
  //     subcategory,
  //     brand,
  //   } = req.body;

  // check category
  const category = await Category.findById(req.body.category);
  if (!category) return next(new Error("category not found!", { cause: 404 }));

  // check subcategory
  const subcategory = await Subcategory.findById(req.body.subcategory);
  if (!subcategory)
    return next(new Error("subcategory not found!", { cause: 404 }));

  // check brand
  const brand = await Brand.findById(req.body.brand);
  if (!brand) return next(new Error("brand not found!", { cause: 404 }));

  // check files
  if (!req.files) return next(new Error("product images are required!"));

  const cloudFolder = nanoid();

  const images = [];
  // upload subimages 3
  for (const file of req.files.subImages) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      { folder: `${process.env.CLOUD_ROOT_FOLDER}/products/${cloudFolder}` }
    );
    images.push({ id: public_id, url: secure_url });
  }

  // images >>> [{id: , url: }, {id: , url: }]

  // upload default image 1
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.defaultImage[0].path,
    { folder: `${process.env.CLOUD_ROOT_FOLDER}/products/${cloudFolder}` }
  );

  // create product
  const product = await Product.create({
    ...req.body,
    createdBy: req.user._id,
    cloudFolder,
    defaultImage: { id: public_id, url: secure_url },
    images, // [{},{}]
  });

  // console.log("Product with discount: ", product.finalPrice);

  // send response
  return res.status(201).json({ success: true, results: product });
});

// delete
export const deleteProduct = asyncHandler(async (req, res, next) => {
  //check product
  const product = await Product.findById(req.params.productId);
  if (!product) return next(new Error("Product not found!", { cause: 404 }));

  // check owner
  if (product.createdBy.toString() !== req.user.id)
    return next(new Error("not authorized!", { cause: 401 }));

  // delete images
  // [id1, id2, id2]
  const ids = product.images.map((image) => image.id);
  ids.push(product.defaultImage.id);
  console.log(ids);

  // delete images
  await cloudinary.api.delete_resources(ids);

  // delete folder
  await cloudinary.api.delete_folder(
    `${process.env.CLOUD_ROOT_FOLDER}/products/${product.cloudFolder}`
  );

  // delete product
  await Product.findByIdAndDelete(req.params.productId);

  return res.json({ success: true, message: "product deleted succesfully!" });
});

// all products
export const allProducts = asyncHandler(async (req, res, next) => {
  // if (req.params.categoryId) {
  //   const products = await Product.find({ category: req.params.categoryId });
  //   return res.json({ success: true, results: products });
  // }
  /////////////// searching ////////////////////////////
  // const { keyword } = req.query;
  // const products = await Product.find({
  //   $or: [
  //     { name: { $regex: keyword, $options: "i" } },
  //     { description: { $regex: keyword, $options: "i" } },
  //   ],
  // });

  const products = await Product.find({ ...req.query })
    .paginate(req.query.page)
    .sort(req.query.sort)
    .customSelect(req.query.fields);

  return res.json({ page: req.query.page, success: true, results: products });
});

// single product
export const singleProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return next(new Error("product not found!"));
  return res.json({ success: true, results: product });
});
