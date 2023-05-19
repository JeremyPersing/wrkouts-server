import { array, number, object, string } from "yup";

export const exerciseSchema = object({
  _id: string(),
  name: string().required().max(150),
  sets: number().required().min(1),
  reps: number().required().min(1),
  weight: number().required().min(1),
});

export const workoutSchema = object({
  userID: string().required().max(200),
  date: string().required().max(20),
  exercises: array()
    .of(exerciseSchema)
    .min(1, "At least 1 exercise is required.")
    .required(),
});
