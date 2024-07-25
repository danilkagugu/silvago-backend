import express from "express";
import {
  addFavoriteProduct,
  addProductToBasket,
  createProduct,
  getBasket,
  getProductById,
  getProducts,
  sendOrder,
  updateProductQuantity,
} from "../conrollers/product.js";
import authMiddlewares from "../middlewares/authMiddlewares.js";

const productRouter = express.Router();

productRouter.post("/", authMiddlewares, createProduct);
productRouter.get("/", getProducts);
productRouter.get("/product/:id", getProductById);
productRouter.get("/basket", authMiddlewares, getBasket);
productRouter.patch("/:id/favorite", addFavoriteProduct);
productRouter.post("/:id/basket", authMiddlewares, addProductToBasket);
productRouter.patch("/basket/:id", authMiddlewares, updateProductQuantity);
productRouter.post("/basket/order", authMiddlewares, sendOrder);

export default productRouter;
