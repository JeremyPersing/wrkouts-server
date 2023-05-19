import express from "express";

import authRouter from "./auth";
import userRouter from "./user";
import workoutsRouter from "./workouts";
import { secureRoute } from "../middleware/expressjwt";

const router = express.Router();

router.use(
  "/workouts",
  secureRoute(process.env.ACCESS_TOKEN_SECRET as string),
  workoutsRouter
);
router.use("/user", userRouter);
router.use(authRouter);

export default router;
