import express, { Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { userAuthSchema } from "../constants";
import { User } from "../models/User";

const router = express.Router();

const handleError = (error: any, res: Response, alternative: string) => {
  if (error?.message) return res.status(400).send(error.message);
  res.status(500).send(alternative);
};

const getUserByEmail = async (email: string) => {
  try {
    return await User.findOne({ email }).exec();
  } catch (error) {
    return null;
  }
};

const handleInvalidEmailOrPassword = (res: Response) =>
  res.status(401).send("Invalid email or password.");

router.post("/register", async (req, res) => {
  try {
    const user = await userAuthSchema.validate(req.body);

    const existingUser = await getUserByEmail(user.email);

    if (existingUser)
      return res.status(409).send("Email is already registered.");

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const dbUser = new User({
      email: user.email,
      password: hashedPassword,
    });

    await dbUser.save();

    res.send({ email: user.email });
  } catch (error) {
    handleError(error, res, "Unable to register account.");
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await userAuthSchema.validate(req.body);
    const existingUser = await getUserByEmail(user.email);
    if (!existingUser) return handleInvalidEmailOrPassword(res);

    const isValid = await bcrypt.compare(user.password, existingUser.password);
    if (!isValid) return handleInvalidEmailOrPassword(res);

    res.send({ email: user.email });
  } catch (error) {
    handleError(error, res, "Unable to login.");
  }
});

export default router;
