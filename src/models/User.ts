import mongoose, { Schema } from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";

export type TimerWorkout = {
  _id?: mongoose.Types.ObjectId;
  name: string;
  rest: number;
  workout: number;
  rounds: number;
};

export type ExerciseTemplate = {
  name: string;
  reps: number;
  sets: number;
  restTime?: number;
};

export type WorkoutTemplate = {
  _id?: mongoose.Types.ObjectId;
  name: string;
  exercises: ExerciseTemplate[];
};

export type User = {
  email: string;
  password?: string;
  socialLoginProvider?: string;
  timerWorkouts: TimerWorkout[];
  workouts?: mongoose.Types.ObjectId[];
};

export const exercisesSchema = new mongoose.Schema<ExerciseTemplate>({
  name: { type: String, required: true },
  reps: { type: Number, required: true, min: 0 },
  sets: { type: Number, required: true, min: 0 },
  restTime: { type: Number, min: 0 },
});

export const workoutTemplateSchema = new mongoose.Schema<WorkoutTemplate>({
  name: { type: String, required: true },
  exercises: [exercisesSchema],
});

export const timerWorkoutSchema = new mongoose.Schema<TimerWorkout>({
  name: { type: String, required: true },
  rest: { type: Number, min: 1, required: true },
  workout: { type: Number, min: 1, required: true },
  rounds: { type: Number, min: 1, required: true },
});

const userSchema = new mongoose.Schema<User>(
  {
    email: { type: String, required: true, min: 1, max: 256 },
    password: { type: String, min: 8 },
    socialLoginProvider: { type: String },
    timerWorkouts: [timerWorkoutSchema],
    workouts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Workout",
        autopopulate: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(mongooseAutoPopulate);

export const User = mongoose.model("User", userSchema);
