import mongoose from "mongoose";

import { env } from "./env.js";

export const connectToMongoDB = async () => {
  await mongoose.connect(env.mongoUri, {
    autoIndex: env.nodeEnv !== "production",
  });

  console.log("Connected to MongoDB");
};
