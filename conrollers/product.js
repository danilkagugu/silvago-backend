import axios from "axios";
import Basket from "../models/basket.js";
import BasketItem from "../models/basketItem.js";
import Category from "../models/category.js";
import FavoriteProduct from "../models/favoritesProducts.js";
import OrderCounter from "../models/orderCounterSchema.js";
import Order from "../models/orderSchema.js";
// import Product from "../models/product.js";
import { createProductSchema } from "../schemas/productSchema.js";

import path from "path";
import * as fs from "node:fs/promises";
import Goods from "../models/torgsoftTest.js";
import BrandTorgsoft from "../models/brandModel.js";
import CategoryTorg from "../models/categoryTorgsoft.js";
import { uploadOrderToFTP } from "../uploadOrderToTorgsoft.js";
import Client from "../models/userTorgsoft.js";
import { generateBreadcrumbs } from "./torgsoft.js";

export const createProduct = async (req, res, next) => {
  try {
    const { error } = createProductSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const newRecord = await Goods.create({
      ...req.body,
      owner: req.user.id,
    });

    res.status(201).json(newRecord);
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  console.log("wrfsdsfgrvd😂🌹👍👍");
  try {
    const products = await Goods.find();

    res.json(products);
  } catch (error) {
    next(error);
  }
};

// export const getDefaultVariations = async (req, res, next) => {
//   try {
//     const { minPrice, maxPrice } = req.query;
//     console.log("maxPrice: ", maxPrice);
//     console.log("minPrice: ", minPrice);

//     const products = await Goods.find();

//     const filteredVariations = {};
//     products.forEach((product) => {
//       let selectedVariation;

//       if (minPrice || maxPrice) {
//         // Фільтруємо варіації за ціною
//         const priceFilteredVariations = product.variations.filter((variant) => {
//           const price = parseFloat(variant.retailPrice);
//           return (
//             (!minPrice || price >= parseFloat(minPrice)) &&
//             (!maxPrice || price <= parseFloat(maxPrice))
//           );
//         });

//         // Якщо знайдені варіації, беремо першу
//         if (priceFilteredVariations.length > 0) {
//           selectedVariation = priceFilteredVariations[0];
//         }
//       }

//       // Якщо немає варіацій за ціною, беремо дефолтну варіацію
//       if (!selectedVariation) {
//         selectedVariation = product.variations.find(
//           (variant) => variant.isDefault
//         );
//       }

//       if (selectedVariation) {
//         filteredVariations[product._id] = selectedVariation;
//       }
//     });

//     res.json(filteredVariations);
//   } catch (error) {
//     next(error);
//   }
// };

// export const getDefaultVariations = async (req, res, next) => {
//   try {
//     const { minPrice, maxPrice } = req.query;

//     const products = await Goods.find();

//     const filteredProducts = products.map((product) => {
//       // Якщо задано фільтр за ціною
//       if (minPrice || maxPrice) {
//         const filteredVariations = product.variations.filter((variant) => {
//           const price = parseFloat(variant.retailPrice);
//           return (
//             (!minPrice || price >= parseFloat(minPrice)) &&
//             (!maxPrice || price <= parseFloat(maxPrice))
//           );
//         });

//         // Якщо є відповідні варіації, повертаємо їх
//         if (filteredVariations.length > 0) {
//           return { ...product.toObject(), variations: filteredVariations };
//         }

//         // Якщо немає відповідних варіацій, виключаємо товар
//         return null;
//       }

//       // Якщо фільтр не задано, повертаємо тільки дефолтну варіацію
//       const defaultVariation = product.variations.find(
//         (variant) => variant.isDefault
//       );

//       if (defaultVariation) {
//         return { ...product.toObject(), variations: [defaultVariation] };
//       }

//       return null; // Виключаємо товари без дефолтних варіацій
//     });

//     res.json(filteredProducts.filter((product) => product !== null));
//   } catch (error) {
//     next(error);
//   }
// };

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
    const { id } = req.params;
    const { volumeId } = req.body;
    console.log("volumeId🐱‍🐉🐱‍👓🐱‍🚀: ", volumeId);

    const product = await Goods.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const selectedVolume = product.volumes.find(
      (vol) => vol._id.toString() === volumeId
    );
    console.log("selectedVolume🎂🤳🎂: ", selectedVolume);
    if (!selectedVolume) {
      return res.status(404).json({ message: "Selected volume not found" });
    }

    const addProduct = await FavoriteProduct.findOneAndUpdate(
      { owner: req.user.id },
      {
        $addToSet: {
          products: [
            {
              product: id,
              productName: product.name,
              productPrice: selectedVolume.price,
              image: selectedVolume.image[0], // перше зображення для обраного об'єму
              volume: selectedVolume.volume,
              price: selectedVolume.price,
              discount: selectedVolume.discount,
              slug: selectedVolume.slug,
              volumeId: volumeId,
              quantityInStock: selectedVolume.quantity,
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
    const { volumeId } = req.body; // id об'єму
    console.log("volumeIdDELETE🎁🤢: ", volumeId);

    const product = await FavoriteProduct.findOneAndUpdate(
      { owner: req.user.id },
      {
        $pull: {
          products: {
            product: id,
            volumeId: volumeId,
          },
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

// Логіка улюблених товарів

export const getFavorites = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Знайти користувача та заповнити favorites
    const user = await Client.findById(userId).populate({
      path: "favorites.productId", // Заповнюємо поле productId
      model: "goods", // Зв'язок із колекцією goods
    });

    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    // Зібрати повну інформацію про кожен товар
    const favoritesWithDetails = user.favorites.map((favorite) => {
      const product = favorite.productId; // Товар із заповненого productId
      if (!product) return null; // Пропускаємо, якщо товар не знайдено
      // console.log("product", product);
      // Знаходимо потрібну варіацію за idTorgsoft
      const variation = product.variations.find(
        (variant) => variant.idTorgsoft === favorite.idTorgsoft
      );

      return {
        productId: product._id,
        modelName: product.modelName,
        brand: product.brand,
        country: product.country,
        categories: product.categories,
        variation, // Додаємо обрану варіацію
      };
    });

    res.status(200).json(favoritesWithDetails.filter((item) => item !== null)); // Видаляємо null-значення
  } catch (error) {
    next(error);
  }
};

export const addFavorite = async (req, res, next) => {
  try {
    const { userId, productId, idTorgsoft } = req.body;

    const user = await Client.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    const product = await Goods.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Товар не знайдено" });
    }

    // Перевірити, чи існує такий idTorgsoft у товарі
    const variationExists = product.variations.some(
      (variant) => variant.idTorgsoft.toString() === idTorgsoft.toString()
    );
    console.log("variationExists", variationExists);
    if (!variationExists) {
      return res
        .status(400)
        .json({ message: "Такої варіації товару не існує" });
    }

    // Перевіряємо, чи вже є такий товар у списку
    const isFavorite = user.favorites.some(
      (favorite) =>
        favorite.productId.toString() === productId &&
        Number(favorite.idTorgsoft) === Number(idTorgsoft)
    );

    if (!isFavorite) {
      user.favorites.push({ productId, idTorgsoft });
      await user.save();
    }

    res.status(200).json(user.favorites);
  } catch (error) {
    next(error);
  }
};

export const removeFavorite = async (req, res, next) => {
  try {
    const { userId, productId, idTorgsoft } = req.body;

    const user = await Client.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    user.favorites = user.favorites.filter(
      (favorite) =>
        favorite.productId.toString() !== productId.toString() ||
        Number(favorite.idTorgsoft) !== Number(idTorgsoft)
    );

    await user.save();

    res.status(200).json(user.favorites);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  const { slug } = req.params;
  try {
    const product = await Goods.findOne({ "variations.slug": slug });
    // console.log("💕💕product", product);
    if (!product) {
      return res.status(404).send("Product not found");
    }

    // Знаходимо конкретний варіант об'єму за slug
    const volume = product.variations.find((v) => v.slug === slug);
    // console.log("volume: 🎁🐱‍🚀🐱‍🚀😊", volume);

    if (!volume) {
      return res.status(404).send("Volume not found");
    }

    res.status(200).json({ product, volume });
  } catch (error) {
    next(error);
  }
};

export const addProductToBasket = async (req, res, next) => {
  try {
    const { quantity, volume, tone, slug } = req.body;

    console.log("slug: ", slug);
    console.log("volume: ", volume);
    console.log("tone: ", tone);
    console.log("quantity: ", quantity);

    // Знаходимо товар у базі даних
    const product = await Goods.findOne({ "variations.slug": slug });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    // Знаходимо варіацію товару за об'ємом і тоном

    const volumeDetails = product.variations.find((v) => {
      const parsedTone =
        typeof v.tone === "string" && v.tone.match(/\d+/)
          ? parseInt(v.tone.match(/\d+/)[0])
          : null;

      return (
        v.volume === volume &&
        (parsedTone === Number(tone) || (tone === null && v.tone === null))
      );
    });
    console.log("volumeDetails", volumeDetails);
    if (!volumeDetails) {
      return res
        .status(400)
        .json({ message: "Volume or tone not found for product" });
    }

    // Знаходимо корзину користувача
    let basket = await Basket.findOne({ owner: req.user.id });
    if (!basket) {
      basket = new Basket({ owner: req.user.id, products: [] });
    }
    // Шукаємо товар у корзині за slug
    const existingProduct = basket.products.find((item) => item.slug === slug);

    if (existingProduct) {
      // Якщо товар є в корзині, збільшуємо кількість
      existingProduct.quantity += quantity;
    } else {
      // Якщо товару немає в корзині, додаємо новий
      basket.products.push({
        idTorgsoft: volumeDetails.idTorgsoft,
        productName: volumeDetails.fullName,
        description: product.description,
        price: volumeDetails.retailPrice,
        quantity,
        quantityStock: volumeDetails.quantity,
        volume: volumeDetails.volume,
        tone: volumeDetails.tone,
        slug: volumeDetails.slug,
        image: volumeDetails.image,
        discount: volumeDetails.discount || 0,
        barcode: volumeDetails.barcode,
        _id: volumeDetails._id,
      });
    }

    // Зберігаємо оновлену корзину
    await basket.save();

    // console.log("basket", basket);

    // Оновлюємо лічильник продажів для товару
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
    // console.log("volume: ", volume);
    // console.log("productId: ", productId);
    // console.log("slug: ", slug);
    // console.log("volume: ", volume);
    // console.log("productId: ", productId);
    // console.log("req.body: ", req.body);

    const basket = await Basket.findOne({ owner: req.user.id });
    // console.log("basket: ", basket);
    basket.products = basket.products.filter(
      (item) => !(item._id.toString() === productId && item.volume === volume)
    );

    await basket.save();
    // console.log("basket: ", basket);
    res.json(basket);
  } catch (error) {
    next(error);
  }
};

export const getBasket = async (req, res, next) => {
  try {
    const basket = await Basket.findOne({ owner: req.user.id });
    // console.log("basket: ", basket);

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

    const basketFromDB = await Basket.findOne({ owner: req.user.id }).populate(
      "products._id"
    );
    if (!basketFromDB || basketFromDB.products.length === 0) {
      return res.status(400).json({ message: "Basket is empty" });
    }

    let orderCounter = await OrderCounter.findOne();
    if (!orderCounter) {
      orderCounter = new OrderCounter();
      orderCounter.count = 1;
    } else {
      orderCounter.count += 1;
    }

    await orderCounter.save();

    for (const productItem of basketFromDB.products) {
      // console.log("basketFromDB: ", basketFromDB);
      console.log("productItem: ", productItem);
      const product = await Goods.findOne(
        { "variations._id": productItem._id },
        { "variations.$": 1 }
      );
      console.log("product", product);
      if (!product || !product.variations[0]) {
        return res.status(400).json({ message: "Product variation not found" });
      }

      const selectedVariation = product.variations[0];

      if (selectedVariation.quantity < productItem.quantity) {
        return res.status(400).json({
          message: `Not enough stock for product ${productItem.productName}`,
        });
      }

      selectedVariation.quantity -= productItem.quantity;

      await Goods.updateOne(
        { "variations._id": productItem._id },
        { $set: { "variations.$.quantity": selectedVariation.quantity } }
      );
    }

    // для TorgSoft

    const goods = basketFromDB.products.map((productItem) => ({
      GoodID: productItem.idTorgsoft.toString(),
      Price: productItem.price,
      Count: productItem.quantity,
    }));

    const orderForTorgsoft = {
      Client: {
        Name: user.fullName,
        MPhone: user.phone,
        ZIP: user.zip || "",
        Country: user.country || "Україна",
        Region: user.region || "",
        City: user.city || "",
        Address: user.addres,
        EMail: user.email || "",
      },
      Options: {
        SaleType: "1",
        Comment: user.comment || "Замовлення з інтернет-магазину",
        OrderNumber: orderCounter.count.toString(),
        DeliveryCondition: user.deliveryCondition || "Нова Пошта",
        DeliveryAddress: user.office || "",
        OrderDate: new Date().toISOString(),
        BonusPay: user.bonusesUsed,
      },
      Goods: goods,
    };
    console.log("orderForTorgsoft", orderForTorgsoft);
    await uploadOrderToFTP(orderForTorgsoft);

    const newOrder = new Order({
      orderNumber: orderCounter.count,
      owner: req.user.id,
      user,
      basket: basketFromDB.products.map((productItem) => ({
        _id: productItem._id,
        productName: productItem.productName,
        price:
          productItem.discount > 0
            ? Math.ceil(
                productItem.price -
                  (productItem.price / 100) * productItem.discount
              )
            : productItem.price,
        image: productItem.image,
        quantity: productItem.quantity,
        volume: productItem.volume,
        tone: productItem.tone,
        discount: productItem.discount || 0,
      })),
      totalAmount: goods.reduce(
        (sum, item) => sum + item.Price * item.Count,
        0
      ),
      allQuantity: goods.reduce((sum, item) => sum + item.Count, 0),
    });
    console.log("newOrder", newOrder);
    await newOrder.save();

    // 8️⃣ **Очищення кошика**
    basketFromDB.products = [];
    await basketFromDB.save();

    // 9️⃣ **Повернення відповіді**
    res.status(201).json({
      message: "Замовлення створено та передано на FTP",
      order: newOrder,
    });
  } catch (error) {
    console.error("🚨 Помилка створення замовлення:", error);
    if (!res.headersSent) {
      return next(error);
    }
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
    const order = await Order.findOne({
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
    const { quantity, volume, tone } = req.body;

    const productId = req.params.id;
    console.log("productId: ", productId);
    const userId = req.user.id;

    let basket = await Basket.findOne({ owner: userId });
    if (!basket) {
      return res.status(404).json({ message: "Basket not found" });
    }
    console.log("basket", basket);
    const product = basket.products.find(
      (item) =>
        item._id.toString() === productId &&
        item.volume === volume &&
        item.tone === tone
    );

    if (product === -1) {
      return res.status(404).json({ message: "Product not found in basket" });
    }

    product.quantity = quantity;

    await basket.save();
    res.status(200).json(basket);
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (req, res, next) => {
  try {
    const categories = await CategoryTorg.find({});
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
    const products = await Goods.find({
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
    const topSellingProducts = await Goods.find()
      .sort({ salesCount: -1 }) // Сортуємо за кількістю продажів (спаданням)
      .limit(10); // Обмежуємо до 10 товарів

    res.json(topSellingProducts);
  } catch (error) {
    next(error);
  }
};

export const getDiscountProducts = async (req, res, next) => {
  try {
    const discountProducts = await Goods.aggregate([
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

export const sendPhoto = async (req, res) => {
  try {
    const photosFolder = path.resolve("C:\\TORGSOFT\\Photo");
    // Читаємо список файлів із папки
    const files = await fs.readdir(photosFolder);
    res.json({ files });
  } catch (error) {
    console.error("Помилка під час надсилання фотографій:", error);
    res.status(500).json({
      message: "Помилка під час надсилання фотографій",
      error: error.message,
    });
  }
};

export const getGoods = async (req, res, next) => {
  try {
    const products = await Goods.find();

    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const getBrandsTorgsoft = async (req, res, next) => {
  try {
    const brands = await BrandTorgsoft.find();

    res.json(brands);
  } catch (error) {
    next(error);
  }
};

/*{
  "watch": ["controllers", "routes", "models", "helpers", "schemas"],
  "ignore": [
    "orders",
    "dataBase",
    "node_modules",
    "tmp",
    "uploads",
    "torgsoftBD"
  ],
  "ext": "js,json",
  "exec": "node server.js"
}
 */

export const getFilteredProducts = async (req, res, next) => {
  try {
    const { category, brand, price, page = 1, limit = 20 } = req.query;

    const query = {};

    // Фільтрація за брендом
    if (brand) {
      const brandIds = brand.split(",").map(Number);

      // Отримуємо назви брендів за їх ідентифікаторами
      const brands = await BrandTorgsoft.find({ numberId: { $in: brandIds } });
      const brandNames = brands.map((brand) => brand.name);
      // console.log("brandNames: ", brandNames);

      // Якщо немає відповідних брендів, повертаємо порожній результат
      if (brandNames.length === 0) {
        return res.json({
          products: [],
          currentPage: Number(page),
          totalPages: 0,
          totalProducts: 0,
        });
      }

      query["brand"] = { $in: brandNames };
    }

    // Фільтрація за категоріями
    if (category) {
      const categoryIds = category.split(",").map(Number);
      query["categories.idTorgsoft"] = { $in: categoryIds };
    }

    let minRetailPrice = 0;
    let maxRetailPrice = 0;
    // let filteredProducts = [];

    const minPriceResult = await Goods.aggregate([
      { $unwind: "$variations" },
      { $match: query },
      { $sort: { "variations.retailPrice": 1 } },
      { $limit: 1 },
      { $project: { _id: 0, retailPrice: "$variations.retailPrice" } },
    ]);

    const maxPriceResult = await Goods.aggregate([
      { $unwind: "$variations" },
      { $match: query },
      { $sort: { "variations.retailPrice": -1 } },
      { $limit: 1 },
      { $project: { _id: 0, retailPrice: "$variations.retailPrice" } },
    ]);

    minRetailPrice = minPriceResult[0]?.retailPrice || 0;
    maxRetailPrice = maxPriceResult[0]?.retailPrice || 0;

    let minPrice, maxPrice;
    if (price) {
      [minPrice, maxPrice] = price.split(",").map(Number); // Конвертуємо значення в числа

      if (!isNaN(minPrice) || !isNaN(maxPrice)) {
        query["variations.retailPrice"] = {};
        if (!isNaN(minPrice)) query["variations.retailPrice"].$gte = minPrice;
        if (!isNaN(maxPrice)) query["variations.retailPrice"].$lte = maxPrice;
      }
    }

    // Отримання товарів з урахуванням пагінації
    let products = await Goods.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean()
      .sort({ randomOrderKey: 1, })
      // .sort({ brand: 1, modelName: 1 });
      // products.sort((a, b) => a.modelName.localeCompare(b.modelName, "uk", { sensitivity: "base" }));

      const filteredProducts = products.map((product) => {
        let filteredVariations = product.variations;
        
        // Фільтруємо варіації за ціною, якщо заданий фільтр
        if (price) {
          filteredVariations = product.variations.filter(
            (variant) =>
              variant.retailPrice >= minPrice &&
              variant.retailPrice <= maxPrice
          );
        }
  
        // Обираємо активну варіацію: спочатку з isDefault, якщо її немає — першу зі списку
        const activeVariation =
          filteredVariations.find((v) => v.isDefault) ||
          filteredVariations[0] ||
          product.variations[0];
  
        return {
          ...product,
          variations: product.variations, // Виводимо всі варіації
          activeVariation,
        };
      });
  

    // Підрахунок загальної кількості товарів для пагінації
    const totalProducts = await Goods.countDocuments(query);

    // Відправка відповіді
    res.json({
      products: filteredProducts,
      currentPage: Number(page),
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
      minPrice: minRetailPrice,
      maxPrice: maxRetailPrice,
    });
  } catch (error) {
    next(error);
  }
};

export const getDefaultVariations = async (req, res, next) => {
  try {
    const products = await Goods.find();

    const defaultVariations = {};
    products.forEach((product) => {
      const defaultVariation = product.variations.find(
        (variant) => variant.isDefault
      );
      if (defaultVariation) {
        defaultVariations[product._id] = defaultVariation;
      }
    });

    res.json(defaultVariations);
  } catch (error) {
    next(error);
  }
};

export const changeProductVariation = async (req, res, next) => {
  try {
    const { productId, volumeId, tone } = req.body;
    console.log("tone: ", tone);
    console.log("volumeId: ", volumeId);
    console.log("productId: ", productId);

    const product = await Goods.findById(productId);
    // console.log("product: ", product);
    if (!product) {
      return res.status(404).json({ message: "Товар не знайдено" });
    }
    // console.log("product", product);
    const selectedVariation = product.variations.find(
      (variant) =>
        variant.idTorgsoft.toString() === volumeId.toString() &&
        (!tone || variant.tone?.toString() === tone.toString()) // Перевіряємо тон, якщо він переданий
    );
    console.log("selectedVariation", selectedVariation);
    if (!selectedVariation) {
      return res.status(404).json({ message: "Варіацію не знайдено" });
    }

    res.json({ [productId]: selectedVariation });
  } catch (error) {
    next(error);
  }
};

export const getPriceRange = async (req, res) => {
  try {
    const products = await Goods.find({}, "variations.retailPrice");

    let minPrice = Infinity;
    let maxPrice = -Infinity;

    products.forEach((product) => {
      product.variations.forEach((variation) => {
        if (variation.retailPrice < minPrice) minPrice = variation.retailPrice;
        if (variation.retailPrice > maxPrice) maxPrice = variation.retailPrice;
      });
    });

    res.status(200).json({ minPrice, maxPrice });
  } catch (error) {
    res.status(500).json({ message: "Не вдалося отримати діапазон цін" });
  }
};

export const getProductByIdTest = async (req, res, next) => {
  const { slug } = req.params;

  try {
    // Знаходимо продукт за slug варіації
    const product = await Goods.findOne({ "variations.slug": slug });
    console.log("product: ", product);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    // Знаходимо конкретний варіант об'єму за slug
    const volume = product.variations.find((v) => v.slug === slug);

    if (!volume) {
      return res.status(404).send("Volume not found");
    }
    console.log("product.categories", product.categories);
    // Генеруємо хлібні крихти
    const breadcrumbs = generateBreadcrumbs(
      product.categories,
      product,
      volume
    );

    // Відправляємо відповідь
    res.status(200).json({ product, volume, breadcrumbs });
  } catch (error) {
    next(error);
  }
};


// export const getCountByFilter = async (req, res) => {
//   try {
//     const { brands, categories } = req.query;

//     // Отримання всіх брендів і категорій
//     const allBrands = await BrandTorgsoft.find().lean();
//     const allCategories = await CategoryTorg.find().lean();

//     // Створюємо мапу для брендів
//     const brandMap = allBrands.reduce((acc, brand) => {
//       acc[brand.numberId] = brand.name;
//       return acc;
//     }, {});

//     // Перетворення brands на назви брендів
//     let brandNames = [];
//     if (brands) {
//       brandNames = brands.split(",").map((id) => brandMap[Number(id)]).filter(Boolean);
//     }

//     // Формування фільтра
//     const query = {};
//     if (brandNames.length) {
//       query.brand = { $in: brandNames };
//     }
//     if (categories) {
//       query["categories.idTorgsoft"] = { $in: categories.split(",").map(Number) };
//     }

//     // --- Підрахунок товарів у брендах ---
//     const brandCounts = await Goods.aggregate([
//       { $match: query }, // Використовуємо фільтри
//       {
//         $lookup: {
//           from: "brandtorgsofts",
//           localField: "brand",
//           foreignField: "name",
//           as: "brandInfo",
//         },
//       },
//       { $unwind: "$brandInfo" },
//       {
//         $group: {
//           _id: "$brandInfo.numberId", // Підраховуємо за `numberId`
//           count: { $sum: 1 },
//         },
//       },
//     ]);

//     // --- Підрахунок товарів у категоріях ---
//     const categoryCounts = await Goods.aggregate([
//       { $match: query },
//       { $unwind: "$categories" },
//       {
//         $group: {
//           _id: "$categories.idTorgsoft",
//           count: { $sum: 1 },
//         },
//       },
//     ]);

//     // Формування списків брендів і категорій
//     const finalBrands = allBrands.map((brand) => ({
//       idTorgsoft: brand.numberId,
//       name: brand.name,
//       count: brandCounts.find((b) => b._id === brand.numberId)?.count || 0,
//     }));

//     const finalCategories = allCategories.flatMap((category) => {
//       const flattenCategory = (cat) => ({
//         idTorgsoft: cat.idTorgsoft,
//         name: cat.name,
//         count: categoryCounts.find((c) => c._id === cat.idTorgsoft)?.count || 0,
//       });

//       const traverseCategories = (cat) => [
//         flattenCategory(cat),
//         ...(cat.children ? cat.children.flatMap(traverseCategories) : []),
//       ];

//       return traverseCategories(category);
//     });

//     res.json({ brandsCount: finalBrands, categoriesCount: finalCategories });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

/*  
export const getCountByFilter = async (req, res) => {
  try {
    const { brands, categories } = req.query;

    // Отримання всіх брендів і категорій
    const allBrands = await BrandTorgsoft.find().lean();
    const allCategories = await CategoryTorg.find().lean();

    // Створюємо мапу для брендів
    const brandMap = allBrands.reduce((acc, brand) => {
      acc[brand.numberId] = brand.name;
      return acc;
    }, {});

    // Перетворення brands на назви брендів
    let brandNames = [];
    if (brands) {
      brandNames = brands.split(",").map((id) => brandMap[Number(id)]).filter(Boolean);
    }

    // --- Підрахунок товарів у брендах (ігноруючи фільтр по брендах) ---
    const brandCounts = await Goods.aggregate([
      {
        $lookup: {
          from: "brandtorgsofts",
          localField: "brand",
          foreignField: "name",
          as: "brandInfo",
        },
      },
      { $unwind: "$brandInfo" },
      {
        $group: {
          _id: "$brandInfo.numberId",
          count: { $sum: 1 },
        },
      },
    ]);

    // --- Підрахунок товарів у категоріях з урахуванням фільтрів ---
    const query = {};
    if (brandNames.length) {
      query.brand = { $in: brandNames };
    }
    if (categories) {
      query["categories.idTorgsoft"] = { $in: categories.split(",").map(Number) };
    }

    const categoryCounts = await Goods.aggregate([
      { $match: query },
      { $unwind: "$categories" },
      {
        $group: {
          _id: "$categories.idTorgsoft",
          count: { $sum: 1 },
        },
      },
    ]);

    // Формування списків брендів і категорій з урахуванням фільтрів
    const finalBrands = allBrands.map((brand) => ({
      idTorgsoft: brand.numberId,
      name: brand.name,
      count: brandCounts.find((b) => b._id === brand.numberId)?.count || 0,
    }));

    const finalCategories = allCategories.flatMap((category) => {
      const flattenCategory = (cat) => ({
        idTorgsoft: cat.idTorgsoft,
        name: cat.name,
        count: categoryCounts.find((c) => c._id === cat.idTorgsoft)?.count || 0,
      });

      const traverseCategories = (cat) => [
        flattenCategory(cat),
        ...(cat.children ? cat.children.flatMap(traverseCategories) : []),
      ];

      return traverseCategories(category);
    });

    res.json({ brandsCount: finalBrands, categoriesCount: finalCategories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
*/

export const getCountByFilter = async (req, res) => {
  try {
    const { brands, categories, price } = req.query;

    // Парсимо ціновий діапазон
    let minPrice = null;
    let maxPrice = null;
    if (price) {
      [minPrice, maxPrice] = price.split(",").map(Number);
    }

    // Отримання всіх брендів і категорій
    const allBrands = await BrandTorgsoft.find().lean();
    const allCategories = await CategoryTorg.find().lean();

    // Створюємо мапу для брендів
    const brandMap = allBrands.reduce((acc, brand) => {
      acc[brand.numberId] = brand.name;
      return acc;
    }, {});

    // Перетворення `brands` на назви брендів
    let brandNames = [];
    if (brands) {
      brandNames = brands.split(",").map((id) => brandMap[Number(id)]).filter(Boolean);
    }

    // Функція для формування фільтра з ціною
    const getPriceFilter = () => {
      if (minPrice !== null || maxPrice !== null) {
        const priceFilter = {};
        if (minPrice !== null) priceFilter.$gte = minPrice;
        if (maxPrice !== null) priceFilter.$lte = maxPrice;
        return { "variations.retailPrice": priceFilter };
      }
      return {};
    };

    const priceFilter = getPriceFilter();

    // --- Підрахунок товарів у категоріях ---
    const categoryQuery = { ...priceFilter };
    if (brandNames.length) {
      categoryQuery.brand = { $in: brandNames };
    }
    if (categories) {
      categoryQuery["categories.idTorgsoft"] = { $in: categories.split(",").map(Number) };
    }

    const categoryCounts = await Goods.aggregate([
      { $match: categoryQuery },
      { $unwind: "$categories" },
      {
        $group: {
          _id: "$categories.idTorgsoft",
          count: { $sum: 1 },
        },
      },
    ]);

    // --- Підрахунок товарів у брендах ---
    const brandQuery = { ...priceFilter };
    if (categories) {
      brandQuery["categories.idTorgsoft"] = { $in: categories.split(",").map(Number) };
    }

    const brandCounts = await Goods.aggregate([
      { $match: brandQuery },
      {
        $lookup: {
          from: "brandtorgsofts",
          localField: "brand",
          foreignField: "name",
          as: "brandInfo",
        },
      },
      { $unwind: "$brandInfo" },
      {
        $group: {
          _id: "$brandInfo.numberId",
          count: { $sum: 1 },
        },
      },
    ]);

    // --- Формування результатів ---
    const finalBrands = allBrands.map((brand) => ({
      idTorgsoft: brand.numberId,
      name: brand.name,
      count: brandCounts.find((b) => b._id === brand.numberId)?.count || 0,
    }));

    const finalCategories = allCategories.flatMap((category) => {
      const flattenCategory = (cat) => ({
        idTorgsoft: cat.idTorgsoft,
        name: cat.name,
        count: categoryCounts.find((c) => c._id === cat.idTorgsoft)?.count || 0,
      });

      const traverseCategories = (cat) => [
        flattenCategory(cat),
        ...(cat.children ? cat.children.flatMap(traverseCategories) : []),
      ];

      return traverseCategories(category);
    });

    res.json({ brandsCount: finalBrands, categoriesCount: finalCategories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};






