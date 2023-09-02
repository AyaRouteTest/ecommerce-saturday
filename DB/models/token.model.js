import mongoose, { Schema, Types, model } from "mongoose";

// schema
const tokenSchema = new Schema(
  {
    token: { type: String, required: true },
    isValid: { type: Boolean, default: true },
    user: { type: Types.ObjectId, required: true, ref: "User" },
    expiredAt: { type: String },
    agent: { type: String },
  },
  { timestamps: true }
);
// model
export const Token = mongoose.models.Token || model("Token", tokenSchema);
