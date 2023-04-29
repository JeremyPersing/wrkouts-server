import mongoose from "mongoose";

const url = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@127.0.0.1:27017/adosus-db`;

export const mongoConnect = async () => {
  await mongoose.connect(url);
};
