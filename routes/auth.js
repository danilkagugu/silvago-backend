import express from "express";
import {
  login,
  register,
  logout,
  registerClient,
  loginTorgsoft,
  logoutClient,
} from "../conrollers/auth.js";
import {
  getCurrentUser,
  getCurrentUserTorgsoft,
  updateUser,
  updateUserTorgsoft,
} from "../conrollers/users.js";

import authMiddlewares from "../middlewares/authMiddlewares.js";
const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.post("/logout", authMiddlewares, logout);
authRouter.get("/current", authMiddlewares, getCurrentUser);
authRouter.patch("/update", authMiddlewares, updateUser);

authRouter.post("/login-client", loginTorgsoft);
authRouter.post("/register-client", registerClient);
authRouter.post("/logout-client", authMiddlewares, logoutClient);
authRouter.get("/current-client", authMiddlewares, getCurrentUserTorgsoft);
authRouter.patch("/update-client", authMiddlewares, updateUserTorgsoft);

export default authRouter;
