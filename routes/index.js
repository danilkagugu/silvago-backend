import express from "express";

import authRouter from "./auth.js";
import productRouter from "./product.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/product", productRouter);

export default router;
