import { object, ref, string } from "yup";

export const clientURL = "http://localhost:3000";

const emailSchema = string().email().max(256).required("An email is required.");
const passwordSchema = string()
  .min(8)
  .max(128)
  .required("A password is required.")
  .matches(
    /(?=.*[a-z])(?=.*[A-Z])((?=.*\d)|(?=.*[@#$%^&-+=()!? "])).{8,128}$/,
    "Your password must have 8 characters, 1 uppercase letter, 1 lowercase letter, and 1 special character or 1 number."
  );

export const userAuthSchema = object({
  email: emailSchema,
  password: passwordSchema,
});

export const oauthLoginSchema = object({
  provider: string().required("Provider is required").max(100),
  token: string().required(),
});

export const forgotUserPasswordSchema = object({
  email: emailSchema,
});

export const resetPasswordSchema = object({
  password: passwordSchema,
  passwordRepeat: string()
    .oneOf([ref("password"), undefined], "Passwords don't match")
    .required("A repeat of the repeat of the password is required."),
});
