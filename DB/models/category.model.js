import mongoose, { Schema, Types, model } from "mongoose";

const categorySchema = new Schema(
  {
    // _id
    name: { type: String, required: true, unique: true },
    slug: { type: String }, // SEO
    image: {
      id: { type: String, required: true },
      url: { type: String, required: true },
    },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    brand: [{ type: Types.ObjectId, ref: "Brand" }],
    //subcategory: [{ type: Types.ObjectId, ref: "Subcategory", required: true }],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

categorySchema.virtual("subcategory", {
  ref: "Subcategory",
  localField: "_id",
  foreignField: "categoryId",
});

export const Category =
  mongoose.models.Category || model("Category", categorySchema);
