import express from "express";
import {
  createBrandAdmin,
  createCategoryAdmin,
  createProductAdmin,
  createSkinNeed,
  delBrand,
  delManyProducts,
  delProduct,
  getBrands,
  getOneBrand,
  getOneProduct,
  getProducts,
  getSkinNeed,
  getUsers,
  updateBrandsAdmin,
  updateProductsAdmin,
} from "../conrollers/admin.js";
import { uploadMiddleware } from "../middlewares/upload.js";
import autoGenerateItemSlugs from "../middlewares/slugMiddlewares.js";
import { getSkinFilters } from "../conrollers/torgsoft.js";
const adminRouter = express.Router();

adminRouter.get("/users", getUsers);
adminRouter.post("/add-product", uploadMiddleware, createProductAdmin);
adminRouter.post("/create-skin", createSkinNeed);
adminRouter.get("/skin", getSkinNeed);
adminRouter.get("/filter", getSkinFilters);
adminRouter.put("/products/:id", uploadMiddleware, updateProductsAdmin);
adminRouter.get("/products", getProducts);
adminRouter.get("/products/one/:id", getOneProduct);
adminRouter.delete("/products/delete/:id", delProduct);
adminRouter.delete("/products/delete-many/", delManyProducts);
adminRouter.post("/add-category", autoGenerateItemSlugs, createCategoryAdmin);
adminRouter.post("/add-brand", uploadMiddleware, createBrandAdmin);
adminRouter.get("/brands", getBrands);
adminRouter.get("/brands/one/:id", getOneBrand);
adminRouter.put("/brands/:id", uploadMiddleware, updateBrandsAdmin);
adminRouter.delete("/brands/delete/:id", delBrand);

export default adminRouter;
