import Basket from "../models/basket.js";
import BasketItem from "../models/basketItem.js";
import Category from "../models/category.js";
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
      article: product.article,
      category: product.category,
      description: product.description,
      volumes: product.volumes,
      characteristics: product.characteristics,
      image: product.image,
      quantity: product.quantity,
      brand: product.brand,
      country: product.country,
    };
    res.status(200).json(productById).end();
  } catch (error) {
    next(error);
  }
};

export const addProductToBasket = async (req, res, next) => {
  try {
    const { quantity, volume } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    let basket = await Basket.findOne({ owner: req.user.id });
    if (!basket) {
      basket = new Basket({ owner: req.user.id, products: [] });
    }
    const indexProduct = basket.products.findIndex(
      (item) =>
        item.product.toString() === product._id.toString() &&
        item.volume === volume // додано перевірку на об'єм
    );
    if (indexProduct >= 0) {
      basket.products[indexProduct].quantity += quantity;
    } else {
      basket.products.push({ product: product._id, quantity, volume }); // додано об'єм
    }

    await basket.save();
    product.salesCount += quantity;
    await product.save();
    res.status(200).json(basket);
  } catch (error) {
    next(error);
  }
};

export const getTopSellingProducts = async (req, res, next) => {
  try {
    const topSellingProducts = await Product.find()
      .sort({ salesCount: -1 }) // Сортуємо за кількістю продажів (спаданням)
      .limit(10); // Обмежуємо до 10 товарів

    res.json(topSellingProducts);
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
    // console.log("basketFromDB.products", basketFromDB.products);
    console.log("basketFromDB", basketFromDB.products);
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
      basket: basketFromDB.products.map((productItem) => {
        const selectedVolume =
          productItem.product.volumes.find(
            (v) => v.volume === productItem.volume
          ) || {};
        return {
          product: productItem.product._id,
          productName: productItem.product.name,
          price: selectedVolume.price,
          image: productItem.product.image,
          quantity: productItem.quantity,
          volume: productItem.volume,
        };
      }),
      totalAmount: basketFromDB.products.reduce((total, productItem) => {
        if (productItem.product && productItem.product.price) {
          return total + productItem.quantity * productItem.product.price;
        }
        return total;
      }, 0),
      allQuantity: totalQuantity,
    });
    // console.log("newOrder", newOrder);

    for (const productItem of basketFromDB.products) {
      const product = await Product.findById(productItem.product._id);

      if (product) {
        const selectedVolume = product.volumes.find(
          (v) => v.volume === productItem.volume
        );

        if (selectedVolume) {
          selectedVolume.quantity -= productItem.quantity;
          if (selectedVolume.quantity < 0) {
            selectedVolume.quantity = 0; // Зберігаємо мінімальне значення як 0
          }
        }

        await product.save();
      }
    }

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
    // console.log("order", order.basket);
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
    const volume = req.body.volume;

    let basket = await Basket.findOne({ owner: userId });
    if (!basket) {
      return res.status(404).json({ message: "Basket not found" });
    }

    const productIndex = basket.products.findIndex(
      (item) => item.product.toString() === productId && item.volume === volume
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

export const getCategory = async (req, res, next) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Помилка сервера" });
  }
};

// export const addProductToBasket = async (req, res, next) => {
//   try {
//     const { volume, price, quantity } = req.body;
//     const { id: productId } = req.params;
//     console.log("productId: ", productId);
//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }
//     let basket = await Basket.findOne({ owner: req.user.id });
//     if (!basket) {
//       basket = new Basket({ owner: req.user.id, items: [] });
//       await basket.save();
//     }
//     let basketItem = await BasketItem.findOne({
//       product: productId,
//       volume,
//       price,
//     });
//     if (basketItem) {
//       // Оновити кількість, якщо товар вже є у корзині
//       basketItem.quantity += quantity;
//       await basketItem.save();
//     } else {
//       // Створити новий товар у корзині
//       basketItem = new BasketItem({
//         product: productId,
//         volume,
//         price,
//         quantity,
//       });
//       await basketItem.save();
//     }
//     if (!basket.items.includes(basketItem._id)) {
//       basket.items.push(basketItem._id);
//       await basket.save();
//     }

//     res.status(200).json(basket);
//     //
//     // const { quantity, volume } = req.body;
//     // const product = await Product.findById(req.params.id);
//     // if (!product) {
//     //   return res.status(404).json({ message: "Product not found" });
//     // }
//     // let basket = await Basket.findOne({ owner: req.user.id });
//     // if (!basket) {
//     //   basket = new Basket({ owner: req.user.id, products: [] });
//     // }
//     // const indexProduct = basket.products.findIndex(
//     //   (item) =>
//     //     item.product.toString() === product._id.toString() &&
//     //     item.volume === volume
//     // );
//     // if (indexProduct >= 0) {
//     //   basket.products[indexProduct].quantity += quantity;
//     // } else {
//     //   basket.products.push({ product: product._id, quantity, volume });
//     // }
//     // await basket.save();
//     // res.status(200).json(basket);
//   } catch (error) {
//     next(error);
//   }
// };

export const searchProducts = async (req, res, next) => {
  try {
    const { query } = req.query;

    // Перевірка, чи є запит
    if (!query) {
      return res.status(400).json({ message: "Запит не може бути порожнім" });
    }

    // Пошук продуктів за допомогою регулярного виразу
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } }, // Пошук за назвою продукту
      ],
    });

    res.json(products);
  } catch (error) {
    next(error);
  }
};
