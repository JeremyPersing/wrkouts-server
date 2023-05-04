import mongoose from "mongoose";

type UserType = {
  email: string;
  password?: string;
  socialLoginProvider?: string;
};

const userSchema = new mongoose.Schema<UserType>({
  email: { type: String, required: true, min: 1, max: 256 },
  password: { type: String, min: 8 },
  socialLoginProvider: { type: String },
});

export const User = mongoose.model("User", userSchema);
