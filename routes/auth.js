import express from "express";
import { login, register, logout } from "../conrollers/auth.js";
import { getCurrentUser, updateUser } from "../conrollers/users.js";

import authMiddlewares from "../middlewares/authMiddlewares.js";
const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.post("/logout", authMiddlewares, logout);
authRouter.get("/current", authMiddlewares, getCurrentUser);
authRouter.patch("/update", authMiddlewares, updateUser);

export default authRouter;
