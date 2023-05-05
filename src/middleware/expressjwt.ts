import { expressjwt } from "express-jwt";

export const secureRoute = (secret: string) =>
  expressjwt({
    secret: secret,
    algorithms: ["HS256"],
    getToken: function fromHeaderOrQuerystring(req) {
      if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
      )
        return req.headers.authorization.split(" ")[1];

      return undefined;
    },
  });
