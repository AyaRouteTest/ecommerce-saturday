import mongoose, { Schema, Types, model } from "mongoose";

const brandSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String }, // SEO
    image: {
      id: { type: String, required: true },
      url: { type: String, required: true },
    },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Brand = mongoose.models.Brand || model("Brand", brandSchema);
