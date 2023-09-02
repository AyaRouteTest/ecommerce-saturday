import mongoose, { Schema, model } from "mongoose";

// schema
const userSchema = new Schema(
  {
    userName: { type: String, required: true, min: 5, max: 20 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "offline",
      enum: ["online", "offline"],
    },
    activationCode: String,
    forgetCode: String,
    profilePic: {
      id: { type: String, default: "ecommerceDefaults/user/profilePic_omg5ry" },
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/doogob7zl/image/upload/v1690825514/ecommerceDefaults/user/profilePic_omg5ry.jpg",
      },
    },
    coverPics: [
      {
        id: { type: String },
        url: { type: String },
      },
    ],
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },
    gender: { type: String, enum: ["male", "female"] },
  },
  { timestamps: true }
);
// model
export const User = mongoose.models.User || model("User", userSchema);
