import cloudinary from "../cloudinary.js";
import HttpError from "../helpers/HttpError.js";
import Brand from "../models/brand.js";
import Category from "../models/category.js";
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
    console.log("req.body.volumes:", req.body.volumes);
    let volumes = [];
    let characteristics = [];
    if (Array.isArray(req.body.volumes)) {
      volumes = req.body.volumes;
    } else if (typeof req.body.volumes === "string") {
      try {
        volumes = JSON.parse(req.body.volumes);
      } catch (err) {
        return res.status(400).json({ error: "Invalid volumes format." });
      }
    }
    if (Array.isArray(req.body.characteristics)) {
      characteristics = req.body.characteristics;
    } else if (typeof req.body.characteristics === "string") {
      try {
        characteristics = JSON.parse(req.body.characteristics);
      } catch (err) {
        return res
          .status(400)
          .json({ error: "Invalid characteristics format." });
      }
    }
    console.log("Parsed volumes:", volumes);
    // console.log("Sending volumes:", JSON.stringify(params.data.volumes));
    const newRecord = await Product.create({
      name: req.body.name,
      article: req.body.article,
      image: result.secure_url,
      category: req.body.category,
      subcategory: req.body.subcategory,
      brand: req.body.brand,
      country: req.body.country,
      description: req.body.description,
      characteristics: characteristics,
      volumes: volumes, // Додаємо об'єм до запису
      quantity: req.body.quantity,
      discount: req.body.discount,
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
    res.status(200).json({
      message: "Product updated successfully",
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

export const createCategoryAdmin = async (req, res, next) => {
  try {
    const newCategory = await Category.create(req.body);

    res.status(201).json(newCategory);
  } catch (error) {
    next(error);
  }
};

export const createBrandAdmin = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required." });
    }
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "image",
    });
    await fs.unlink(req.file.path);
    const newBrand = await Brand.create({
      name: req.body.name,
      image: result.secure_url,
    });

    res.status(201).json({ data: newBrand });
  } catch (error) {
    next(error);
  }
};

export const getBrands = async (req, res, next) => {
  try {
    const brands = await Brand.find();

    res.json(brands);
  } catch (error) {
    next(error);
  }
};

export const getOneBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findOne({ _id: id });
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    const brandById = {
      id: brand._id,
      name: brand.name,

      image: brand.image,
    };
    res.status(200).json(brandById).end();
  } catch (error) {
    next(error);
  }
};

export const delBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const brands = await Brand.findByIdAndDelete({ _id: id });

    res.json(brands);
  } catch (error) {
    next(error);
  }
};

export const updateBrandsAdmin = async (req, res, next) => {
  try {
    const { name } = req.body;
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
      ...(image && { image }),
    };
    if (typeof error !== "undefined") {
      throw HttpError(400, error.details[0].message);
    }
    const { id } = req.params;
    const updatedBrand = await Brand.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    const feedbackMessage = {
      id: updatedBrand._id,
      name: updatedBrand.name,
      image: updatedBrand.image,
    };
    res.status(200).json({
      message: "Brand updated successfully",
      data: feedbackMessage,
    });
  } catch (error) {
    next(error);
  }
};
