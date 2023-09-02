import { asyncHandler } from "./../../utils/asyncHandler.js";
import { Brand } from "./../../../DB/models/brand.model.js";
import cloudinary from "./../../utils/cloud.js";
import slugify from "slugify";

// create
export const createbrand = asyncHandler(async (req, res, next) => {
  // data
  const { name } = req.body;

  // file
  if (!req.file)
    return next(new Error("brand image is required!", { cause: 400 }));

  const slug = slugify(name);

  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.CLOUD_ROOT_FOLDER}/brand`,
    }
  );

  // create
  const brand = await Brand.create({
    name,
    slug,
    image: { id: public_id, url: secure_url },
    createdBy: req.user._id,
  });

  // response
  return res.status(201).json({ success: true, results: brand });
});

// update
export const updatebrand = asyncHandler(async (req, res, next) => {
  // check brand
  const brand = await Brand.findById(req.params.brandId); // brand owner
  if (!brand) return next(new Error("brand not found!", { cause: 404 }));

  // check owner
  if (req.user.id !== brand.createdBy.toString())
    return next(new Error("Not authorized!", { cause: 401 }));

  // file
  if (req.file) {
    const { secure_url } = await cloudinary.uploader.upload(req.file.path, {
      public_id: brand.image.id,
    });
    brand.image.url = secure_url;
  }

  // name
  brand.name = req.body.name ? req.body.name : brand.name;
  brand.slug = req.body.name ? slugify(req.body.name) : brand.slug;

  await brand.save();
  // response
  return res.status(201).json({ success: true, results: brand });
});

// delete
export const deletebrand = asyncHandler(async (req, res, next) => {
  // check brand
  const brand = await Brand.findById(req.params.brandId); // brand owner
  if (!brand) return next(new Error("brand not found!", { cause: 404 }));

  // check owner
  // if (req.user.id.equals(brand.createdBy))
  if (req.user.id != brand.createdBy.toString())
    return next(new Error("Not authorized!", { cause: 401 }));

  // delete brand
  const results = await cloudinary.uploader.destroy(brand.image.id);
  console.log(results);

  if (results.result === "ok") {
    await Brand.findByIdAndDelete(req.params.brandId);
  }

  // response
  return res.json({ success: true, message: "brand deleted successully!" });
});

// get all brand
export const allBrands = asyncHandler(async (req, res, next) => {
  // find
  const brands = await Brand.find({});
  return res.json({ success: true, results: brands });
});
