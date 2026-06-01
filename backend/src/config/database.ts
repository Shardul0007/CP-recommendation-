import mongoose from "mongoose";
import { env } from "./env";

export const connectToDatabase = async (): Promise<void> => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongodbUri);
};

export const disconnectFromDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
};
