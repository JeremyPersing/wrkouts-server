import { config } from "dotenv";
config();
import express from "express";
import cors from "cors";
import { expressjwt, Request as JWTRequest } from "express-jwt";

import { mongoConnect } from "./db/mongoConnect";
import auth from "./routes/auth";

mongoConnect()
  .then(() => {
    const app = express();

    app.use(express.json());
    app.use(cors());

    app.get(
      "/api/v1/me",
      expressjwt({
        secret: process.env.ACCESS_TOKEN_SECRET as string,
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
        if (req.auth?.id) return res.send(req.auth.id);
        res.send("No Id");
      }
    );
    app.use("/api/v1", auth);
    app.get("/", (req, res) => res.send("Hi"));

    const PORT = 4000;

    app.listen(PORT, () => console.log("listening on port", PORT));
  })
  .catch((error: any) => {
    console.error("unable to connect to database", error);
  });
