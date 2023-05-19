import mongoose, { Schema } from "mongoose";

export type Exercise = {
  name: string;
  reps: number;
  sets: number;
  weight: number;
};

export type Workout = {
  userID: mongoose.Types.ObjectId;
  date: string;
  exercises: Exercise[];
};

const exerciseSchema = new Schema<Exercise>({
  name: { type: String, required: true, maxlength: 150 },
  reps: { type: Number, required: true, min: 1, max: 20000 },
  sets: { type: Number, required: true, min: 1, max: 20000 },
  weight: { type: Number, required: true, min: 1, max: 20000 },
});

const workoutSchema = new Schema<Workout>(
  {
    userID: { type: Schema.Types.ObjectId, ref: "User" },
    date: { type: String, required: true, maxlength: 20 },
    exercises: [exerciseSchema],
  },
  {
    timestamps: true,
  }
);

export const Workout = mongoose.model("Workout", workoutSchema);
