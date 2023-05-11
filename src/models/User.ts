import mongoose from "mongoose";

export type TimerWorkoutType = {
  _id?: mongoose.Types.ObjectId;
  name: string;
  rest: number;
  workout: number;
  rounds: number;
};

export type UserType = {
  email: string;
  password?: string;
  socialLoginProvider?: string;
  timerWorkouts: TimerWorkoutType[];
};

export const timerWorkoutSchema = new mongoose.Schema<TimerWorkoutType>({
  name: { type: String, required: true },
  rest: { type: Number, min: 1, required: true },
  workout: { type: Number, min: 1, required: true },
  rounds: { type: Number, min: 1, required: true },
});

const userSchema = new mongoose.Schema<UserType>({
  email: { type: String, required: true, min: 1, max: 256 },
  password: { type: String, min: 8 },
  socialLoginProvider: { type: String },
  timerWorkouts: [timerWorkoutSchema],
});

export const User = mongoose.model("User", userSchema);
