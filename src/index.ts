import { config } from "dotenv";
config();
import express from "express";
import cors from "cors";

import { mongoConnect } from "./db/mongoConnect";
import router from "./routes/index";

mongoConnect()
  .then(() => {
    const app = express();

    app.use(express.json());
    app.use(cors());

    app.use("/api/v1", router);

    const PORT = 4000;

    app.listen(PORT, () => console.log("Now listening on port", PORT));
  })
  .catch((error: any) => {
    console.error("unable to connect to database", error);
  });
