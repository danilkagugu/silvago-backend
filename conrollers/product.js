import Basket from "../models/basket.js";
import FavoriteProduct from "../models/favoritesProducts.js";
import Order from "../models/orderSchema.js";
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
export const getFavoriteProducts = async (req, res, next) => {
  try {
    const products = await FavoriteProduct.find({ owner: req.user.id });

    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const addFavoriteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    console.log("product: ", product);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const addProduct = await FavoriteProduct.findOneAndUpdate(
      { owner: req.user.id },
      {
        $addToSet: {
          products: [
            {
              product: product._id,
              productName: product.name,
              productPrice: product.price,
              image: product.image,
            },
          ],
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.status(200).json(addProduct);
  } catch (error) {
    next(error);
  }
};

export const deleteFavoriteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await FavoriteProduct.findOneAndUpdate(
      { owner: req.user.id },
      {
        $pull: {
          products: { product: id },
        },
      },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: "Favorite product not found" });
    }
    res.json(product);
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
    const { quantity } = req.body;
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
      basket.products[indexProduct].quantity += quantity;
    } else {
      basket.products.push({ product: product._id, quantity });
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

export const sendOrder = async (req, res, next) => {
  try {
    const { user } = req.body;

    if (!user) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    // Перевіряємо чи є кошик у користувача
    const basketFromDB = await Basket.findOne({ owner: req.user.id }).populate(
      "products.product"
    );
    console.log("basketFromDB: ", basketFromDB);
    if (!basketFromDB || basketFromDB.products.length === 0) {
      return res.status(400).json({ message: "Basket is empty" });
    }

    const totalQuantity = basketFromDB.products.reduce((total, productItem) => {
      return total + productItem.quantity;
    }, 0);

    // Створюємо нове замовлення з продуктами з кошика
    const newOrder = new Order({
      owner: req.user.id,
      user,
      basket: basketFromDB.products.map((productItem) => ({
        product: productItem.product._id,
        productName: productItem.product.name,
        productPrice: productItem.product.price,
        image: productItem.product.image,
        quantity: productItem.quantity,
      })),
      totalAmount: basketFromDB.products.reduce((total, productItem) => {
        if (productItem.product && productItem.product.price) {
          return total + productItem.quantity * productItem.product.price;
        }
        return total;
      }, 0),
      allQuantity: totalQuantity,
    });

    const order = await newOrder.save();
    // Очищуємо кошик після створення замовлення
    basketFromDB.products = [];
    await basketFromDB.save();

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    console.error("Error creating order:", error);

    if (!res.headersSent) {
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }

    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.find({ owner: req.user.id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const updateProductQuantity = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const productId = req.params.id;
    const userId = req.user.id;

    let basket = await Basket.findOne({ owner: userId });
    if (!basket) {
      return res.status(404).json({ message: "Basket not found" });
    }

    const productIndex = basket.products.findIndex(
      (item) => item.product.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in basket" });
    }

    basket.products[productIndex].quantity = quantity;

    await basket.save();
    res.status(200).json(basket);
  } catch (error) {
    next(error);
  }
};
