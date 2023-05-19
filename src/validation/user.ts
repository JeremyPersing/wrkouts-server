import { array, number, object, string } from "yup";

export const timerWorkoutSchema = object({
  name: string().required().max(100),
  rest: number().required().min(1),
  workout: number().required().min(1),
  rounds: number().required().min(1),
});

export const exerciseSchema = object({
  name: string().required().max(100),
  reps: number().required("Please enter the number of reps").min(1),
  sets: number().required("Please enter the sets").min(1),
  weight: number().required("Please enter the weight performed").min(1),
});

export const workoutSchema = object({
  date: string().required(),
  exercises: array()
    .of(exerciseSchema)
    .min(1, "At least 1 exercise is required.")
    .required(),
});

export const exerciseTemplateSchema = object({
  name: string().required().max(100),
  reps: number().required("Please enter the number of reps").min(0),
  sets: number().required("Please enter the sets").min(0),
  restTime: number().min(0),
});

export const workoutTemplateSchema = object({
  name: string().required(),
  exercises: array()
    .of(exerciseTemplateSchema)
    .min(1, "At least 1 exercise is required.")
    .required(),
});
