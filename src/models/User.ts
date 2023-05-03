import mongoose from "mongoose";

type UserType = {
  email: string;
  password: string;
};

const userSchema = new mongoose.Schema<UserType>({
  email: { type: String, required: true, min: 1, max: 256 },
  password: { type: String, required: true, min: 8 },
});

export const User = mongoose.model("User", userSchema);
