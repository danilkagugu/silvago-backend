import express from "express";
import { createProduct, getProducts } from "../conrollers/product.js";
import auth from "../middlewares/auth.js";

const productRouter = express.Router();

productRouter.post("/", auth, createProduct);
productRouter.get("/", getProducts);

export default productRouter;
