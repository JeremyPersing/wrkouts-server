import express, { Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { expressjwt, Request as JWTRequest } from "express-jwt";

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

const createTokenPair = (userID: string) => {
  const accessToken = jwt.sign(
    { id: userID },
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: 60 * 60 * 24,
    }
  );

  const refreshToken = jwt.sign(
    { id: userID },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: 60 * 60 * 24 * 7,
    }
  );

  return { accessToken, refreshToken };
};

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

    const { accessToken, refreshToken } = createTokenPair(dbUser.id);

    res.send({ id: dbUser?.id, accessToken, refreshToken });
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

    const { accessToken, refreshToken } = createTokenPair(existingUser.id);

    res.send({ id: existingUser?.id, accessToken, refreshToken });
  } catch (error) {
    handleError(error, res, "Unable to login.");
  }
});

router.post(
  "/token",
  expressjwt({
    secret: process.env.REFRESH_TOKEN_SECRET as string,
    algorithms: ["HS256"],
    getToken: function fromHeaderOrQuerystring(req) {
      if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
      )
        return req.headers.authorization.split(" ")[1];

      return undefined;
    },
  }),
  async (req: JWTRequest, res) => {
    if (req.auth?.id) {
      const { accessToken, refreshToken } = createTokenPair(req.auth.id);
      return res.send({ accessToken, refreshToken });
    }

    // probably will never get to this point
    res.status(401).send("Refresh Token has expired");
  }
);

export default router;
