import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...", process.env.MONGO_URI);
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/courier-23"
    );
    console.log("✅ MongoDB connected");
  } catch (error: any) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};
