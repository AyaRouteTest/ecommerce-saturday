import mongoose from "mongoose";

export const connectDB = async () => {
  return await mongoose
    .connect(process.env.CONNECTION_URL)
    .then(() => console.log("DB connected...... !"))
    .catch(() => console.log("Failed to connect DB!"));
};
