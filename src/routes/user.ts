import express from "express";
import mongoose from "mongoose";
import { Request } from "express-jwt";
import { TimerWorkoutType, User } from "../models/User";
import { timerWorkoutSchema } from "../constants";
import { handleError } from "../utils/handleError";
import { secureRoute } from "../middleware/expressjwt";

const router = express.Router();

router.post(
  "/workouts/timer",
  secureRoute(process.env.ACCESS_TOKEN_SECRET as string),
  async (req: Request, res) => {
    try {
      const workout = await timerWorkoutSchema.validate(req.body);

      const timerWorkout: TimerWorkoutType = {
        name: workout.name,
        rest: workout.rest,
        workout: workout.workout,
        rounds: workout.rounds,
      };

      const user = await User.findById(req.auth?.id).exec();
      if (!user) return res.status(404).send("User not found");

      if (!user?.timerWorkouts) user.timerWorkouts = [];

      user.timerWorkouts.push(timerWorkout);
      await user.save();

      res.send(user.timerWorkouts);
    } catch (error) {
      handleError(error, res, "Internal Server Error.");
    }
  }
);

router.get(
  "/workouts/timer",
  secureRoute(process.env.ACCESS_TOKEN_SECRET as string),
  async (req: Request, res) => {
    try {
      const user = await User.findById(req.auth?.id).exec();

      if (!user) return res.status(404).send("Not not found");

      res.send(user.timerWorkouts);
    } catch (error) {
      handleError(error, res, "Internal Server Error.");
    }
  }
);

router.patch(
  "/workouts/timer/:id",
  secureRoute(process.env.ACCESS_TOKEN_SECRET as string),
  async (req: Request, res) => {
    try {
      if (!req.params.id) return res.status(400).send("No workout id provided");
      const workout = await timerWorkoutSchema.validate(req.body);

      const user = await User.findById(req.auth?.id).exec();
      if (!user) return res.status(404).send("User not found");

      const id = new mongoose.Types.ObjectId(req.params.id);
      const filteredWorkoutIndex = user.timerWorkouts.findIndex((i) =>
        i?._id?.equals(id)
      );

      if (filteredWorkoutIndex === -1)
        return res.status(404).send("Workout not found");

      const updateWorkout = user.timerWorkouts[filteredWorkoutIndex];
      updateWorkout.name = workout.name;
      updateWorkout.rest = workout.rest;
      updateWorkout.rounds = workout.rounds;
      updateWorkout.workout = workout.workout;

      await user.save();

      res.send(user.timerWorkouts);
    } catch (error) {
      handleError(error, res, "Internal Server Error.");
    }
  }
);

router.delete(
  "/workouts/timer/:id",
  secureRoute(process.env.ACCESS_TOKEN_SECRET as string),
  async (req: Request, res) => {
    try {
      if (!req.params.id) return res.status(400).send("No workout id provided");

      const user = await User.findById(req.auth?.id).exec();
      if (!user) return res.status(404).send("User not found");

      const id = new mongoose.Types.ObjectId(req.params.id);
      const filteredWorkouts = user.timerWorkouts.filter(
        (i) => !i?._id?.equals(id)
      );

      user.timerWorkouts = filteredWorkouts;

      await user.save();

      res.send(user.timerWorkouts);
    } catch (error) {
      handleError(error, res, "Internal Server Error.");
    }
  }
);

export default router;
