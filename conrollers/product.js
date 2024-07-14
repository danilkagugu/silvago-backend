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

// export const addFavoriteProduct = async (req, res, next) => {
//   try {
//     const product = await Product.findByIdAndUpdate(
//       req.params.id,
//       {
//         favorite: true,
//       },
//       { new: true }
//     );
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }
//     res.status(200).json(product);
//   } catch (error) {
//     next(error);
//   }
// };
