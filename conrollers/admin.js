import cloudinary from "../cloudinary.js";
import HttpError from "../helpers/HttpError.js";
import Product from "../models/product.js";
import User from "../models/user.js";
import { createProductSchema } from "../schemas/productSchema.js";
import * as fs from "node:fs/promises";
export const createProductAdmin = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required." });
    }
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "image",
    });
    await fs.unlink(req.file.path);
    const newRecord = await Product.create({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      subcategory: req.body.subcategory,
      image: result.secure_url,
    });
    res.status(201).json({ data: newRecord });
  } catch (error) {
    next(error);
  }
};

export const updateProductsAdmin = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      subcategory,
      price,
      quantity,
      discount,
    } = req.body;
    let image = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "images",
      });

      image = result.secure_url;

      await fs.unlink(req.file.path);
    }
    const updateData = {
      ...(name && { name }),
      ...(description && { description }),
      ...(category && { category }),
      ...(subcategory && { subcategory }),
      ...(price && { price }),
      ...(quantity && { quantity }),
      ...(discount && { discount }),
      ...(image && { image }),
    };
    if (typeof error !== "undefined") {
      throw HttpError(400, error.details[0].message);
    }
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    const feedbackMessage = {
      id: updatedProduct._id,
      name: updatedProduct.name,
      description: updatedProduct.description,
      category: updatedProduct.category,
      subcategory: updatedProduct.subcategory,
      price: updatedProduct.price,
      quantity: updatedProduct.quantity,
      discount: updatedProduct.discount,
      image: updatedProduct.image,
    };
    console.log(feedbackMessage);
    res.status(200).json({
      message: "User updated successfully",
      data: feedbackMessage,
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    console.log("products: ", products);

    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const getOneProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category } = req.query;
    const product = await Product.findOne({ _id: id });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const productById = {
      id: product._id,
      name: product.name,
      category: product.category,
      subcategory: product.subcategory,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      discount: product.discount,
      image: product.image,
    };
    res.status(200).json(productById).end();
  } catch (error) {
    next(error);
  }
};

export const delProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const products = await Product.findByIdAndDelete({ _id: id });

    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const delManyProducts = async (req, res, next) => {
  try {
    const ids = req.query.ids.split(","); // Отримуємо масив ID із запиту
    const result = await Product.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Продукти не знайдені" });
    }

    res.status(200).json({ message: "Продукти успішно видалені" });
  } catch (error) {
    next(error);
  }
};