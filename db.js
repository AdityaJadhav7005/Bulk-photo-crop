import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "photo_crop_app"
    });

    console.log("MongoDB connected:", conn.connection.host);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // app बंद कर
  }
};

export default connectDB;
