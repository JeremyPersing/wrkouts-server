import { Response } from "express";

export const handleError = (error: any, res: Response, alternative: string) => {
  if (error?.message) return res.status(400).send(error.message);
  res.status(500).send(alternative);
};
