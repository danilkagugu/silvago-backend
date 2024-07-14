import Basket from "../models/basket.js";
import Product from "../models/product.js";
import { createProductSchema } from "../schemas/productSchema.js";

export const createProduct = async (req, res, next) => {
  try {
    const { error } = createProductSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const newRecord = await Product.create({
      ...req.body,
      owner: req.user.id,
    });
    res.status(201).json(newRecord);
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

export const addFavoriteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    product.favorite = !product.favorite;
    await product.save();
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const productById = {
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
    };
    res.status(200).json(productById).end();
  } catch (error) {
    next(error);
  }
};

export const addProductToBasket = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    let basket = await Basket.findOne({ owner: req.user.id });
    if (!basket) {
      basket = new Basket({ owner: req.user.id, products: [] });
    }
    const indexProduct = basket.products.findIndex(
      (item) => item.product.toString() === product._id.toString()
    );
    if (indexProduct >= 0) {
      basket.products[indexProduct].quantity += 1;
    } else {
      basket.products.push({ product: product._id, quantity: 1 });
    }
    await basket.save();
    res.status(200).json(basket);
  } catch (error) {
    next(error);
  }
};

export const getBasket = async (req, res, next) => {
  try {
    const basket = await Basket.findOne({ owner: req.user.id });

    if (!basket) {
      return res.status(404).json({ message: "Basket not found" });
    }
    res.json(basket);
  } catch (error) {
    next(error);
  }
};
