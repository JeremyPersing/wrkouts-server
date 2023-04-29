import { config } from "dotenv";
config();
import express from "express";

import { mongoConnect } from "./db/mongoConnect";

mongoConnect()
  .then(() => {
    const app = express();

    app.use(express.json());

    app.get("/", (req, res) => res.send("Hi"));

    const PORT = 4000;

    app.listen(PORT, () => console.log("listening on port", PORT));
  })
  .catch((error: any) => {
    console.error("unable to connect to database", error);
  });
