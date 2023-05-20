import { config } from "dotenv";
config();
import express from "express";
import cors from "cors";
import { rateLimit } from "express-rate-limit";

import { mongoConnect } from "./db/mongoConnect";
import router from "./routes/index";

mongoConnect()
  .then(() => {
    const app = express();

    app.use(express.json());
    if (process.env.NODE_ENV !== "production") app.use(cors());

    const apiLimiter = rateLimit({
      windowMs: 1000, // 1 second
      max: 8, // Limit each IP to 8 requests per `window` (here, per 1 sec)
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    });

    app.use("/api/v1", apiLimiter, router);

    const PORT = 4000;

    app.listen(PORT, () => console.log("Now listening on port", PORT));
  })
  .catch((error: any) => {
    console.error("unable to connect to database", error);
  });
