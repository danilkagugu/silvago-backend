import axios from "axios";
import Basket from "../models/basket.js";
import BasketItem from "../models/basketItem.js";
import Category from "../models/category.js";
import FavoriteProduct from "../models/favoritesProducts.js";
import OrderCounter from "../models/orderCounterSchema.js";
import Order from "../models/orderSchema.js";
import Product from "../models/product.js";
import uniproProducts from "../models/uniproProduct.js";
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
    console.log("тільки що оновились подукти😉😉");
    // console.log("products: ", products);

    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const addFavoriteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
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
              product: id,
              productName: product.name,
              productPrice: product.price,
              image: product.image,
              volumes: product.volumes,
              _id: id,
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
    // res.status(200).json({
    //   message: "Success",
    //   updatedFavorites: await FavoriteProduct.find({ owner: req.user.id }),
    // });
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
    // res.status(200).json({
    //   message: "Success",
    //   updatedFavorites: await FavoriteProduct.find({ owner: req.user.id }),
    // });
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
    // console.log("req.body;", req.body);
    // console.log("req.params;", req.params);
    const { quantity, volume, price } = req.body;

    console.log("volume: ", volume);
    console.log("priceqq: ", price);
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
      basket.products.push({ product: product._id, quantity, volume, price }); // додано об'єм
    }

    await basket.save();
    product.salesCount += quantity;
    await product.save();
    res.status(200).json(basket);
  } catch (error) {
    next(error);
  }
};

export const deleteProductFromBasket = async (req, res, next) => {
  try {
    const { productId, volume } = req.body;
    console.log("req.body: ", req.body);

    const basket = await Basket.findOne({ owner: req.user.id });
    basket.products = basket.products.filter(
      (item) =>
        !(item.product.toString() === productId && item.volume === volume)
    );

    await basket.save();
    res.json(basket);
  } catch (error) {
    next(error);
  }
};

export const getBasket = async (req, res, next) => {
  try {
    // console.log("req.user.id✌❤❤", req.user.id);
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
    console.log("user: ", user);

    if (!user) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    // Перевіряємо чи є кошик у користувача
    const basketFromDB = await Basket.findOne({ owner: req.user.id }).populate(
      "products.product"
    );

    if (!basketFromDB || basketFromDB.products.length === 0) {
      return res.status(400).json({ message: "Basket is empty" });
    }

    const totalQuantity = basketFromDB.products.reduce((total, productItem) => {
      return total + productItem.quantity;
    }, 0);

    let orderCounter = await OrderCounter.findOne();
    if (!orderCounter) {
      orderCounter = new OrderCounter();
      orderCounter.count += 1;
    }
    orderCounter.count += 1;
    // Збільшуємо лічильник на 1
    await orderCounter.save();
    // Створюємо нове замовлення з продуктами з кошика
    const newOrder = new Order({
      orderNumber: orderCounter.count,
      owner: req.user.id,
      user,
      basket: basketFromDB.products.map((productItem) => {
        console.log("productItem: ", productItem);
        const selectedVolume =
          productItem.product.volumes.find(
            (v) => v.volume === productItem.volume
          ) || {};
        return {
          product: productItem.product._id,
          productName: productItem.product.name,
          price: Math.ceil(
            selectedVolume.discount > 0
              ? selectedVolume.price -
                  (selectedVolume.price / 100) * selectedVolume.discount
              : selectedVolume.price
          ),
          image: productItem.product.image,
          quantity: productItem.quantity,
          volume: productItem.volume,
          discount: selectedVolume.discount || 0,
        };
      }),
      totalAmount: basketFromDB.products.reduce((total, productItem) => {
        const selectedVolume = productItem.product.volumes.find(
          (v) => v.volume === productItem.volume
        );
        console.log("selectedVolume", selectedVolume);
        if (selectedVolume) {
          if (selectedVolume.discount) {
            return (
              total +
              Math.ceil(
                selectedVolume.discount > 0
                  ? selectedVolume.price -
                      (selectedVolume.price / 100) * selectedVolume.discount
                  : selectedVolume.price
              ) *
                productItem.quantity
            );
          } else {
            return total + selectedVolume.price * productItem.quantity;
          }
        }
        return total;
      }, 0),
      allQuantity: totalQuantity,
    });
    console.log("newOrder", newOrder);
    for (const productItem of basketFromDB.products) {
      console.log("productItem.product._id", productItem.product._id);
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
    console.log("order: ", order);
    // Очищуємо кошик після створення замовлення
    basketFromDB.products = [];
    await basketFromDB.save();
    console.log("newOrder", JSON.stringify(newOrder, null, 2));

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
    // console.log("order", order);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
};
export const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.find({
      orderNumber: orderId,
      owner: req.user.id,
    });
    // console.log("order", order);
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
    const { quantity, volume } = req.body;

    const productId = req.params.id;
    const userId = req.user.id;

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

export const getDiscountProducts = async (req, res, next) => {
  try {
    const discountProducts = await Product.aggregate([
      { $unwind: "$volumes" }, // Розгортаємо масив volumes
      { $match: { "volumes.discount": { $gt: 0 } } }, // Фільтруємо продукти з ненульовою знижкою
      { $sort: { "volumes.discount": -1 } }, // Сортуємо за знижкою (спаданням)
      {
        $group: {
          _id: "$_id",
          product: { $first: "$$ROOT" },
          volumes: { $push: "$volumes" }, // Зберігаємо всі об'єми
        },
      },
      {
        $replaceRoot: {
          newRoot: { $mergeObjects: ["$product", { volumes: "$volumes" }] },
        },
      }, // Заміщуємо кореневий документ
    ]);

    res.json(discountProducts);
  } catch (error) {
    next(error);
  }
};

// Тест Unipro
const UNIPRO_API_URL = "https://api.unipro.ua/";

export const getUnipro = async (req, res) => {
  try {
    const { goods } = req.body; // Отримання даних товарів з тіла запиту

    // Перебір масиву товарів та збереження кожного з них у базі даних
    const savedProducts = await Promise.all(
      goods.map(async (productData) => {
        // Перевірка, чи товар вже існує в базі даних
        const existingProduct = await uniproProducts.findOne({
          barcode: productData.barcode,
        });

        if (existingProduct) {
          // Якщо товар існує, оновлюємо його дані
          existingProduct.set(productData);
          return await existingProduct.save();
        } else {
          // Якщо товар не існує, створюємо новий
          const product = new uniproProducts(productData);
          return await product.save();
        }
      })
    );

    // Відправка успішної відповіді
    res.status(201).json({
      message: "Товари успішно додані або оновлені",
      data: savedProducts,
    });
  } catch (error) {
    console.error("Помилка при додаванні товарів:", error);
    res.status(500).json({
      message: "Помилка при додаванні товарів",
      error: error.message,
    });
  }
};

export const sendUnipro = async (req, res) => {
  try {
    // Отримання даних з Unipro (приклад даних)
    const uniproProducts = req.body.goods;

    // Відправка даних до інтернет-магазину через API
    const response = await axios.post(
      "http://localhost:3030/products",
      uniproProducts
    );

    // Відповідь після успішного надсилання
    res.status(200).json({
      message: "Товари успішно надіслані до інтернет-магазину",
      data: response.data,
    });
  } catch (error) {
    console.error("Помилка під час надсилання товарів:", error);
    res.status(500).json({
      message: "Помилка під час надсилання товарів",
      error: error.message,
    });
  }
};
