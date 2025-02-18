import jwt from "jsonwebtoken";
import HttpError from "../helpers/HttpError.js";
import "dotenv/config";
import Client from "../models/userTorgsoft.js";

const authMiddlewares = (req, res, next) => {
  const { authorization = "" } = req.headers;

  const [bearer, token] = authorization.split(" ", 2);
  if (bearer !== "Bearer") next(HttpError(401, "invalid token"));

  jwt.verify(token, process.env.SECRET_KEY, async (err, decode) => {
    if (err) next(HttpError(401, "invalid token"));

    try {
      const user = await Client.findById(decode.id);

      if (!user) throw HttpError(401, "Not authorized");

      if (user.token !== token) throw HttpError(401, "Not authorized");
      req.user = { id: decode.id };

      next();
    } catch (error) {
      next(error);
    }
  });
};

export default authMiddlewares;
