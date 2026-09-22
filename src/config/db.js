import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");
  } catch (e) {
    console.log("Mongo db connection failed", e);
    process.exit(1);
  }
};
