import express, { Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { expressjwt, Request as JWTRequest } from "express-jwt";
import { OAuth2Client } from "google-auth-library";

import {
  clientURL,
  forgotUserPasswordSchema,
  oauthLoginSchema,
  resetPasswordSchema,
  userAuthSchema,
} from "../constants";
import { User } from "../models/User";
import { sendEmail } from "../utils/sendEmail";
import { secureRoute } from "../middleware/expressjwt";

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

const createForgotPasswordToken = (email: string) =>
  jwt.sign({ email }, process.env.EMAIL_TOKEN_SECRET as string, {
    expiresIn: 60 * 10,
  });

const verifyGoogleIDToken = async (idToken: string) => {
  try {
    // https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;
    const emailVerified = payload?.email_verified;

    return { email, emailVerified };
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
    if (!existingUser || !existingUser.password)
      return handleInvalidEmailOrPassword(res);

    const isValid = await bcrypt.compare(user.password, existingUser.password);
    if (!isValid) return handleInvalidEmailOrPassword(res);

    const { accessToken, refreshToken } = createTokenPair(existingUser.id);

    res.send({ id: existingUser?.id, accessToken, refreshToken });
  } catch (error) {
    handleError(error, res, "Unable to login.");
  }
});

router.post("/oauth/login", async (req, res) => {
  try {
    const { token, provider } = await oauthLoginSchema.validate(req.body);
    if (provider === "google") {
      const payload = await verifyGoogleIDToken(token);

      if (!payload) return res.status(400).send("Unable to login.");

      const { email, emailVerified } = payload;
      if (!emailVerified) return res.status(403).send("Invalid credentials");
      if (!email) return res.send(401).send("Unable to get info");

      let existingUser = await getUserByEmail(email);

      if (
        existingUser?.socialLoginProvider &&
        existingUser?.socialLoginProvider !== provider
      )
        return res.send("Email already registered.");

      // User needs to register account or user needs to be logged in
      if (
        !existingUser ||
        (existingUser.email === email &&
          existingUser?.socialLoginProvider === provider)
      ) {
        if (!existingUser) {
          existingUser = new User({
            email,
            socialLoginProvider: provider,
          });

          await existingUser.save();
        }

        const { accessToken, refreshToken } = createTokenPair(existingUser.id);
        return res.send({ id: existingUser.id, accessToken, refreshToken });
      }
    }

    res.status(401).send("Unable to get info");
  } catch (error) {
    handleError(error, res, "Unable to login.");
  }
});

router.post("/forgotpassword", async (req, res) => {
  const response = {
    message: "",
    emailSent: false,
  };

  try {
    const { email } = await forgotUserPasswordSchema.validate(req.body);

    const user = await getUserByEmail(email);

    if (!user) {
      response.message = "Email not registered.";
      return res.send(response);
    }

    if (user && user?.socialLoginProvider) {
      response.message =
        "That account is linked to a social login provider. Please use your social account to login.";
      return res.send(response);
    }

    const token = createForgotPasswordToken(user.email);
    const link = `${clientURL}/user/resetpassword/${token}`;
    const subject = "Forgot Your Password?";
    const text = "Reset your password for your account";

    const html =
      `
  	<p>It looks like you forgot your password.
  	If you did, please click the link below to reset it.
  	If you did not, disregard this email. Please update your password
  	within 10 minutes, otherwise you will have to repeat this
  	process. <a href=` +
      link +
      `>Click to Reset Password</a>
  	</p><br />`;

    await sendEmail({
      to: email,
      subject,
      text,
      html,
    });

    response.message =
      "An email has been sent displaying instructions on how to change your password. Please check the inbox of the email you provided.";
    response.emailSent = true;
    res.send(response);
  } catch (error: any) {
    handleError(error, res, "Internal Server Error");
  }
});

router.post(
  "/resetpassword",
  secureRoute(process.env.EMAIL_TOKEN_SECRET as string),
  async (req: JWTRequest, res) => {
    try {
      const { password } = await resetPasswordSchema.validate(req.body);

      if (req.auth?.email) {
        const user = await getUserByEmail(req.auth.email);

        if (user) {
          const hashedPassword = await bcrypt.hash(password, 10);

          user.password = hashedPassword;
          await user.save();

          return res.send("Password reset");
        }
      }

      res.send("Unable to reset password.");
    } catch (error) {
      handleError(error, res, "Unable to reset password.");
    }
  }
);

router.post(
  "/token",
  secureRoute(process.env.REFRESH_TOKEN_SECRET as string),
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
