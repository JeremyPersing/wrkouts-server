import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => res.send("Hi"));

const PORT = 4000;

app.listen(PORT, () => console.log("listening on port", PORT));
