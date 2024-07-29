import express from "express";
import {
  addFavoriteProduct,
  addProductToBasket,
  createProduct,
  deleteFavoriteProduct,
  getBasket,
  getFavoriteProducts,
  getOrder,
  getProductById,
  getProducts,
  sendOrder,
  updateProductQuantity,
} from "../conrollers/product.js";
import authMiddlewares from "../middlewares/authMiddlewares.js";

const productRouter = express.Router();

productRouter.post("/", authMiddlewares, createProduct);
productRouter.get("/", getProducts);
productRouter.get("/favorite", authMiddlewares, getFavoriteProducts);
productRouter.delete("/favorite/:id", authMiddlewares, deleteFavoriteProduct);
productRouter.get("/product/:id", getProductById);
productRouter.get("/basket", authMiddlewares, getBasket);
productRouter.post("/:id/favorite", authMiddlewares, addFavoriteProduct);
productRouter.post("/:id/basket", authMiddlewares, addProductToBasket);
productRouter.patch("/basket/:id", authMiddlewares, updateProductQuantity);
productRouter.post("/basket/order", authMiddlewares, sendOrder);
productRouter.get("/order", authMiddlewares, getOrder);

export default productRouter;
