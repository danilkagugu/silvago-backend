import express from "express";
import {
  addFavoriteProduct,
  createProduct,
  getProducts,
} from "../conrollers/product.js";
import auth from "../middlewares/auth.js";

const productRouter = express.Router();

productRouter.post("/", auth, createProduct);
productRouter.get("/", getProducts);
productRouter.patch("/:id/favorite", addFavoriteProduct);

export default productRouter;
