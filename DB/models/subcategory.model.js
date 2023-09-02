import mongoose, { Schema, Types, model } from "mongoose";

const subCategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String }, // SEO
    image: {
      id: { type: String, required: true },
      url: { type: String, required: true },
    },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    brand: [{ type: Types.ObjectId, ref: "Brand" }],

    categoryId: { type: Types.ObjectId, ref: "Category", required: true },
  },
  { timestamps: true }
);

export const Subcategory =
  mongoose.models.Subcategory || model("Subcategory", subCategorySchema);
