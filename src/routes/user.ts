import express from "express";
import { Request } from "express-jwt";

import { User } from "../models/User";
import { secureRoute } from "../middleware/expressjwt";

const router = express.Router();

router.get(
  "/me",
  secureRoute(process.env.ACCESS_TOKEN_SECRET as string),
  async (req: Request, res) => {
    try {
      const user = await User.findById(req.auth?.id).exec();
      if (!user) return res.status(404).send("User not found");

      user.password = undefined;
      res.send(user);
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  }
);

// Save these for another weekend

// router.post(
//   "/workouts/timer",
//   secureRoute(process.env.ACCESS_TOKEN_SECRET as string),
//   async (req: Request, res) => {
//     try {
//       const workout = await timerWorkoutSchema.validate(req.body);

//       const timerWorkout: TimerWorkout = {
//         name: workout.name,
//         rest: workout.rest,
//         workout: workout.workout,
//         rounds: workout.rounds,
//       };

//       const user = await User.findById(req.auth?.id).exec();
//       if (!user) return res.status(404).send("User not found");

//       if (!user?.timerWorkouts) user.timerWorkouts = [];

//       user.timerWorkouts.push(timerWorkout);
//       await user.save();

//       res.send(user.timerWorkouts);
//     } catch (error) {
//       handleError(error, res, "Internal Server Error.");
//     }
//   }
// );

// router.get(
//   "/workouts/timer",
//   secureRoute(process.env.ACCESS_TOKEN_SECRET as string),
//   async (req: Request, res) => {
//     try {
//       const user = await User.findById(req.auth?.id).exec();

//       if (!user) return res.status(404).send("Not not found");

//       res.send(user.timerWorkouts);
//     } catch (error) {
//       handleError(error, res, "Internal Server Error.");
//     }
//   }
// );

// router.patch(
//   "/workouts/timer",
//   secureRoute(process.env.ACCESS_TOKEN_SECRET as string),
//   async (req: Request, res) => {
//     try {
//       const workout = await timerWorkoutSchema.validate(req.body);

//       const user = await User.findById(req.auth?.id).exec();
//       if (!user) return res.status(404).send("User not found");

//       const filteredWorkoutIndex = user.timerWorkouts.findIndex(
//         (i) => i.name === workout.name
//       );

//       if (filteredWorkoutIndex === -1)
//         return res.status(404).send("Workout not found");

//       const updateWorkout = user.timerWorkouts[filteredWorkoutIndex];
//       updateWorkout.name = workout.name;
//       updateWorkout.rest = workout.rest;
//       updateWorkout.rounds = workout.rounds;
//       updateWorkout.workout = workout.workout;

//       await user.save();

//       res.send(user.timerWorkouts);
//     } catch (error) {
//       handleError(error, res, "Internal Server Error.");
//     }
//   }
// );

// router.delete(
//   "/workouts/timer/:name",
//   secureRoute(process.env.ACCESS_TOKEN_SECRET as string),
//   async (req: Request, res) => {
//     try {
//       if (!req.params.name)
//         return res.status(400).send("No workout name provided");

//       const user = await User.findById(req.auth?.id).exec();
//       if (!user) return res.status(404).send("User not found");

//       const filteredWorkouts = user.timerWorkouts.filter(
//         (i) => i.name !== req.params.name
//       );

//       if (filteredWorkouts.length === user.timerWorkouts.length)
//         return res.status(404).send("Workout not found.");

//       user.timerWorkouts = filteredWorkouts;

//       await user.save();

//       res.send(user.timerWorkouts);
//     } catch (error) {
//       handleError(error, res, "Internal Server Error.");
//     }
//   }
// );

// router.post(
//   "/workouts/templates",
//   secureRoute(process.env.ACCESS_TOKEN_SECRET as string),
//   async (req: Request, res) => {
//     try {
//       const workout = await workoutTemplateSchema.validate(req.body);

//       const user = await User.findById(req.auth?.id).exec();
//       if (!user) return res.status(404).send("User not found");

//       if (!user?.workoutTemplates) user.workoutTemplates = [];

//       user.workoutTemplates.push(workout);
//       await user.save();

//       res.send(user.workoutTemplates);
//     } catch (error) {
//       handleError(error, res, "Internal Server Error.");
//     }
//   }
// );

// router.get(
//   "/workouts/templates",
//   secureRoute(process.env.ACCESS_TOKEN_SECRET as string),
//   async (req: Request, res) => {
//     try {
//       const user = await User.findById(req.auth?.id).exec();

//       if (!user) return res.status(404).send("Not not found");

//       res.send(user.workoutTemplates);
//     } catch (error) {
//       handleError(error, res, "Internal Server Error.");
//     }
//   }
// );

// router.patch(
//   "/workouts/templates/:id",
//   secureRoute(process.env.ACCESS_TOKEN_SECRET as string),
//   async (req: Request, res) => {
//     try {
//       if (!req.params.id) return res.status(400).send("No workout id provided");
//       const workout = await workoutTemplateSchema.validate(req.body);

//       const user = await User.findById(req.auth?.id).exec();
//       if (!user) return res.status(404).send("User not found");

//       const id = new mongoose.Types.ObjectId(req.params.id);
//       const filteredWorkoutIndex = user.workoutTemplates.findIndex((i) =>
//         i?._id?.equals(id)
//       );

//       if (filteredWorkoutIndex === -1)
//         return res.status(404).send("Workout not found");

//       const prevWorkout = user.workoutTemplates[filteredWorkoutIndex];

//       user.workoutTemplates[filteredWorkoutIndex] = {
//         _id: prevWorkout._id,
//         ...workout,
//       };

//       await user.save();

//       res.send(user.workoutTemplates);
//     } catch (error) {
//       handleError(error, res, "Internal Server Error.");
//     }
//   }
// );

// router.delete(
//   "/workouts/templates/:id",
//   secureRoute(process.env.ACCESS_TOKEN_SECRET as string),
//   async (req: Request, res) => {
//     try {
//       if (!req.params.id) return res.status(400).send("No workout id provided");

//       const user = await User.findById(req.auth?.id).exec();
//       if (!user) return res.status(404).send("User not found");

//       const id = new mongoose.Types.ObjectId(req.params.id);
//       const filteredWorkouts = user.workoutTemplates.filter(
//         (i) => !i?._id?.equals(id)
//       );

//       if (filteredWorkouts.length === user.workoutTemplates.length)
//         return res.status(404).send("Workout not found");

//       user.workoutTemplates = filteredWorkouts;

//       await user.save();

//       res.send(user.workoutTemplates);
//     } catch (error) {
//       handleError(error, res, "Internal Server Error.");
//     }
//   }
// );

export default router;
