import express from "express";
import {
  createProductAdmin,
  delManyProducts,
  delProduct,
  getOneProduct,
  getProducts,
  getUsers,
  updateProductsAdmin,
} from "../conrollers/admin.js";
import { uploadMiddleware } from "../middlewares/upload.js";
const adminRouter = express.Router();

adminRouter.get("/users", getUsers);
adminRouter.get("/products", getProducts);
adminRouter.get("/products/one/:id", getOneProduct);
adminRouter.delete("/products/delete/:id", delProduct);
adminRouter.delete("/products/delete-many/", delManyProducts);
adminRouter.post("/add-product", uploadMiddleware, createProductAdmin);
adminRouter.put("/products/:id", uploadMiddleware, updateProductsAdmin);

export default adminRouter;
