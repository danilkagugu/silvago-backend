import express from "express";
import { login, register, logout } from "../conrollers/auth.js";
import { getCurrentUser } from "../conrollers/users.js";
import authMiddleware from "../middlewares/auth.js";
const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.post("/logout", authMiddleware, logout);
authRouter.get("/current", authMiddleware, getCurrentUser);

export default authRouter;
