import express from "express";
import {
  addFavoriteProduct,
  addProductToBasket,
  createProduct,
  deleteFavoriteProduct,
  deleteProductFromBasket,
  getBasket,
  getCategory,
  getDiscountProducts,
  getFavoriteProducts,
  getOrder,
  getProductById,
  getProducts,
  getTopSellingProducts,
  searchProducts,
  sendOrder,
  updateProductQuantity,
} from "../conrollers/product.js";
import authMiddlewares from "../middlewares/authMiddlewares.js";

const productRouter = express.Router();

productRouter.post("/", authMiddlewares, createProduct);
productRouter.get("/", getProducts);
productRouter.get("/favorite", authMiddlewares, getFavoriteProducts);
productRouter.post("/favorite/:id", authMiddlewares, addFavoriteProduct);
productRouter.delete("/favorite/:id", authMiddlewares, deleteFavoriteProduct);
productRouter.get("/product/:id", getProductById);
productRouter.get("/basket", authMiddlewares, getBasket);
productRouter.post("/:id/basket", authMiddlewares, addProductToBasket);
// productRouter.post("/basket/:id", authMiddlewares, addProductToBasket);
productRouter.delete(
  "/basket/delete/",
  authMiddlewares,
  deleteProductFromBasket
);
productRouter.patch("/basket/:id", authMiddlewares, updateProductQuantity);
productRouter.post("/basket/order", authMiddlewares, sendOrder);
productRouter.get("/order", authMiddlewares, getOrder);
productRouter.get("/category", getCategory);
productRouter.get("/search", searchProducts);
productRouter.get("/top-selling-products", getTopSellingProducts);
productRouter.get("/discount-products", getDiscountProducts);
// productRouter.post("/update-products", getUnipro);
// productRouter.post("/send-products", getUnipro);

export default productRouter;
