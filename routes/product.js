import express from "express";

import path from "path";

import {
  addFavorite,
  addFavoriteProduct,
  addProductToBasket,
  changeProductVariation,
  createProduct,
  deleteFavoriteProduct,
  deleteProductFromBasket,
  getBasket,
  getBrandsTorgsoft,
  getCategory,
  getCountByFilter,
  getDefaultVariations,
  getDiscountProducts,
  getFavoriteProducts,
  getFavorites,
  getFilteredProducts,
  getGoods,
  getOrder,
  getOrderById,
  getPriceRange,
  getProductById,
  getProductByIdTest,
  getProducts,
  getTopSellingProducts,
  removeFavorite,
  searchProducts,
  sendOrder,
  sendPhoto,
  updateProductQuantity,
} from "../conrollers/product.js";
import authMiddlewares from "../middlewares/authMiddlewares.js";
import { getBd, getCategoriesTree } from "../conrollers/torgsoft.js";

const productRouter = express.Router();

productRouter.get("/photos/list", sendPhoto);
productRouter.post("/", authMiddlewares, createProduct);
productRouter.get("/", getProducts);

productRouter.get("/sync", getBd);
productRouter.get("/get/goods", getGoods);
productRouter.post("/get-variation", changeProductVariation);
productRouter.get("/get-default-variation", getDefaultVariations);
productRouter.get("/getcatalog", getFilteredProducts);

productRouter.get("/get/brand", getBrandsTorgsoft);
productRouter.get("/price-range", getPriceRange);

productRouter.post("/favorites", authMiddlewares, addFavorite); // Додати товар
productRouter.delete("/favorites", authMiddlewares, removeFavorite); // Видалити товар
productRouter.get("/favorites/:userId", authMiddlewares, getFavorites); // Отримати список
productRouter.get("/product/:slug", getProductByIdTest);
// productRouter.get("/producttest/:slug", getProductByIdTest);
productRouter.get("/basket", authMiddlewares, getBasket);
productRouter.post("/:slug/basket", authMiddlewares, addProductToBasket);
productRouter.delete(
  "/basket/delete/",
  authMiddlewares,
  deleteProductFromBasket
);
productRouter.patch("/basket/:id", authMiddlewares, updateProductQuantity);
productRouter.post("/basket/order", authMiddlewares, sendOrder);
productRouter.get("/order", authMiddlewares, getOrder);
productRouter.get("/order/:orderId", authMiddlewares, getOrderById);
productRouter.get("/category", getCategory);
productRouter.get("/category-torgsoft", getCategoriesTree);
productRouter.get("/search", searchProducts);
productRouter.get("/top-selling-products", getTopSellingProducts);
productRouter.get("/discount-products", getDiscountProducts);
productRouter.get("/filter", getCountByFilter);

export default productRouter;
