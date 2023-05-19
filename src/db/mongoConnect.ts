import mongoose from "mongoose";

// const url = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@127.0.0.1:27017/adosus-db`;
const url = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@wrkouts-db.u4hz0vb.mongodb.net/?retryWrites=true&w=majority`;

export const mongoConnect = async () => {
  await mongoose.connect(url);
};
