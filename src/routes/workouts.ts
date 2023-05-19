import express from "express";
import { Request } from "express-jwt";

import { handleError } from "../utils/handleError";
import { Workout } from "../models/Workout";
import { workoutSchema } from "../validation/workouts";
import { User } from "../models/User";

const router = express.Router();

router.post("/", async (req: Request, res) => {
  try {
    const workout = await workoutSchema.validate(req.body);
    const user = await User.findById(req.auth?.id).exec();
    if (!user)
      return res.status(404).send("User not found. Unable to save workout.");

    const newWorkout = new Workout({
      userID: req.auth?.id,
      date: workout.date,
      exercises: workout.exercises,
    });

    await newWorkout.save();

    if (!user?.workouts) user.workouts = [];
    user.workouts.unshift(newWorkout._id._id);

    await user.save();

    res.send(newWorkout);
  } catch (error) {
    handleError(error, res, "Internal Server Error");
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!req.params.id)
      return res.status(400).send("Please provide a workout id.");

    const workout = await Workout.findById(req.params.id).exec();
    if (!workout) return res.status(404).send("Workout not found.");

    res.send(workout);
  } catch (error) {
    handleError(error, res, "Internal Server Error");
  }
});

router.put("/:id", async (req: Request, res) => {
  try {
    if (!req.params.id)
      return res.status(400).send("Please provide a workout id.");

    const workout = await workoutSchema.validate(req.body);

    const newWorkout = await Workout.findByIdAndUpdate(
      req.params.id,
      {
        date: workout.date,
        exercises: workout.exercises,
      },
      { returnOriginal: false }
    ).exec();

    res.send(newWorkout);
  } catch (error) {
    handleError(error, res, "Internal Server Error");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!req.params.id)
      return res.status(400).send("Please provide a workout id.");

    const workout = await Workout.findByIdAndDelete(req.params.id).exec();
    if (!workout) return res.status(404).send("Workout not found.");

    res.sendStatus(204);
  } catch (error) {
    handleError(error, res, "Internal Server Error");
  }
});

export default router;
