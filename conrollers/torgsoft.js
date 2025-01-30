import fs from "fs/promises";
import path from "path";
import Goods from "../models/torgsoftTest.js";
import Papa from "papaparse";
import iconv from "iconv-lite";
import slugify from "slugify";
import BrandTorgsoft from "../models/brandModel.js";
import CategoryTorg from "../models/categoryTorgsoft.js";
import mongoose from "mongoose";
import { Filter } from "../models/filters.js";

// Шляхи до папок
const sourceFolder = "C:\\Журнал Torgsoft";
const destinationFolder =
  "C:\\Users\\home\\Documents\\GitHub\\silvago-backend\\dataBase";

const goodsFile = path.join(destinationFolder, "TSGoods.trs");
const clientsFile = path.join(destinationFolder, "TSClients.trs");

async function copyFile(fileName) {
  const sourcePath = path.join(sourceFolder, fileName);
  const destPath = path.join(destinationFolder, fileName);

  try {
    await fs.copyFile(sourcePath, destPath); // Асинхронний метод без колбеку
    return `Файл ${fileName} успішно скопійовано.`;
  } catch (err) {
    throw new Error(`Помилка копіювання файлу ${fileName}: ${err.message}`);
  }
}

export const getBd = async (req, res) => {
  try {
    // Копіюємо файли з Torgsoft
    const results = await Promise.all([
      copyFile("TSClients.trs"),
      copyFile("TSGoods.trs"),
    ]);

    // Парсимо товари з файлу
    const parsedProducts = await parseGoodsFile();

    // Зберігаємо товари у базу з фотографіями
    await saveProductsToDb(parsedProducts);

    res.json({
      message: "Синхронізація успішна",
      details: results,
      products: parsedProducts,
    });
  } catch (error) {
    console.error("Помилка синхронізації:", error);
    res.status(500).json({
      message: "Помилка синхронізації",
      error: error.message,
    });
  }
};

export async function parseGoodsFile() {
  try {
    // Читаємо файл як Buffer
    const fileBuffer = await fs.readFile(goodsFile);

    // Конвертуємо з Windows-1251 у UTF-8
    const fileContent = iconv.decode(fileBuffer, "win1251");

    // Парсимо CSV
    const parsedData = Papa.parse(fileContent, {
      header: false, // У вашому файлі немає заголовків
      delimiter: ";", // Роздільник
      skipEmptyLines: true,
    });
    // console.log("parsedData", parsedData);
    // Мапінг даних
    const products = parsedData.data.map((row) => ({
      id: parseInt(row[0], 10), // ID товару
      brand: row[41], // Назва для бренду
      fullName: row[1], // Повна назва для кожного з об'ємів
      description: row[2], // Опис
      country: row[3], // Країна виробник
      retailPrice: parseFloat(row[5]), // Ціна
      discountPrice: parseFloat(row[7]), // Ціна зі знижкою
      discount: row[40], // знижка
      barcode: row[21], // Штрихкод
      article: row[4], // Артикул
      quantity: row[10],
      volume: row[12], // об'єм
      tone: row[13], // 12
      categories: parseCategories(row[47]), // Категорія
      productTypeFull: row[18], // Категорія
      skinNeeds: row[51], // Потреби шкіри
      modelName: row[15], // назва моделі
      modelId: row[42], // Id моделі
    }));

    // console.log("Розпарсені товари:", products);
    return products;
  } catch (err) {
    console.error("Помилка при читанні файлу товарів:", err);
    throw err;
  }
}

export async function saveProductsToDb(products) {
  try {
    await syncBrands(products);
    await syncCategories(products);
    const photosFolder = path.resolve("C:\\TORGSOFT\\Photo");
    const files = await fs.readdir(photosFolder);

    const photoMap = files.reduce((acc, file) => {
      const match = file.match(/^(\d+)(_?\d*)\.(jpg|png)$/);
      if (match) {
        const id = match[1];
        acc[id] = acc[id] || [];
        acc[id].push(`http://localhost:3030/photos/${file}`);
      }
      return acc;
    }, {});

    // Групуємо товари за modelId
    const groupedProducts = products.reduce((acc, product) => {
      console.log("product🎶💖💖💋: ", product);
      const photos = photoMap[product.id] || [];
      // console.log("photos: ", photos[0]);
      const groupKey = product.modelId;

      if (!acc[groupKey]) {
        acc[groupKey] = {
          // name: product.name,
          modelName: product.modelName,
          modelId: product.modelId,
          brand: product.brand,
          country: product.country,
          categories: product.categories,
          variations: [],
          // skinNeeds: product.skinNeeds.trim() === "" ? null : product.skinNeeds,
        };
      }

      const existingVariation = acc[groupKey].variations.find(
        (v) => v.idTorgsoft === product.id
      );

      if (!existingVariation) {
        acc[groupKey].variations.push({
          idTorgsoft: product.id,
          fullName: product.fullName,
          volume: product.volume,
          tone: product.tone || null,
          retailPrice: product.retailPrice,
          discountPrice: product.discountPrice || null,
          discount: product.discount || 0,
          quantity: product.quantity,
          barcode: product.barcode,
          image: photos[0],
          images: photos,
          slug: `${slugify(product.modelName, {
            lower: true,
            strict: true,
          })}${product.tone ? `-${product.tone}` : ""}-${product.volume}ml`,
          isDefault: false,
        });
      }

      return acc;
    }, {});

    // Зберігаємо товари
    const finalProducts = Object.values(groupedProducts);
    // console.log("finalProducts: ", finalProducts);

    for (const product of finalProducts) {
      if (product.variations.length > 0) {
        // Знаходимо варіацію з найбільшим об'ємом
        const defaultVariation = product.variations.reduce((max, variation) => {
          const currentVolume = parseFloat(variation.volume); // Перетворюємо volume у число
          const maxVolume = parseFloat(max?.volume || 0); // Перетворюємо max.volume у число
          return currentVolume > maxVolume ? variation : max;
        }, null);

        if (defaultVariation) {
          defaultVariation.isDefault = true; // Встановлюємо isDefault
        }
      }
    }

    for (const product of finalProducts) {
      if (product.skinNeeds) {
        await updateFilter("skinNeeds", product.skinNeeds.split(","));
      }
      await Goods.updateOne(
        { modelId: product.modelId },
        { $set: product },
        { upsert: true }
      );
    }

    console.log(`Успішно збережено ${finalProducts.length} товарів.`);
  } catch (err) {
    console.error("Помилка при збереженні товарів у базу:", err);
    throw err;
  }
}

async function syncCategories(products) {
  const categoryTree = {};

  for (const product of products) {
    let currentLevel = categoryTree;

    // Проходимо по кожній категорії товару
    for (const category of product.categories) {
      const slug = slugify(category.name, { lower: true, strict: true });

      // Додаємо категорію, якщо її ще немає на поточному рівні
      if (!currentLevel[slug]) {
        currentLevel[slug] = {
          idTorgsoft: category.idTorgsoft,
          name: category.name,
          slug,
          children: {},
          _id: new mongoose.Types.ObjectId(), // Генеруємо _id
        };
      }

      // Переходимо до дочірнього рівня
      currentLevel = currentLevel[slug].children;
    }
  }

  // Перетворення дерева у формат для MongoDB
  const buildMongoTree = (tree) => {
    return Object.values(tree).map((node) => ({
      idTorgsoft: node.idTorgsoft, // Додаємо ID Torgsoft
      name: node.name, // Назва категорії
      slug: node.slug,
      children: buildMongoTree(node.children),
      _id: node._id,
    }));
  };

  const categoriesToSave = buildMongoTree(categoryTree);

  // Видаляємо старі категорії перед вставкою
  await CategoryTorg.deleteMany();
  await CategoryTorg.insertMany(categoriesToSave);

  console.log("Категорії синхронізовано успішно.");
}

function parseCategories(categoryString) {
  // console.log("categoryString: ", categoryString);
  return categoryString
    .split(";")
    .map((item) => {
      // console.log("item: ", item);
      const [id, categoryName] = item.split("=");
      // console.log("id: ", id);
      if (!id || !categoryName) return null; // Ігноруємо некоректні значення

      return {
        idTorgsoft: parseInt(id, 10), // Преобразуємо ID у число
        name: categoryName.trim(), // Забираємо зайві пробіли у назві
        slug: slugify(categoryName.trim(), { lower: true, strict: true }), // Формуємо slug
      };
    })
    .filter(Boolean); // Видаляємо null або порожні значення
}

//отримання дерева категорій

export async function getCategoriesTree(req, res) {
  try {
    // Отримуємо всі категорії з бази
    const categories = await CategoryTorg.find();

    // Повертаємо категорії напряму
    res.json(categories);
  } catch (error) {
    console.error("Помилка при отриманні дерева категорій:", error);
    res.status(500).json({ message: "Помилка при отриманні дерева категорій" });
  }
}

//Вибір тону або об'єму
const updateFilter = async (type, options) => {
  const filter = await Filter.findOne({ type });

  if (!filter) {
    // Якщо фільтр ще не існує, створюємо його
    const newFilter = {
      type,
      options: options.map((name, index) => ({
        name: name.trim(),
        value: index + 1,
        slug: slugify(name.trim(), { lower: true, strict: true }), // Формуємо slug
      })),
    };
    await Filter.create(newFilter);
  } else {
    // Оновлюємо існуючий фільтр, додаючи нові опції
    const existingOptions = filter.options.map((opt) => opt.name);
    const newOptions = options.filter(
      (name) => !existingOptions.includes(name.trim())
    );

    filter.options.push(
      ...newOptions.map((name, index) => ({
        name: name.trim(),
        value: filter.options.length + index + 1,
        slug: slugify(name.trim(), { lower: true, strict: true }), // Формуємо slug
      }))
    );

    await filter.save();
  }
};

export const getSkinFilters = async (req, res, next) => {
  try {
    const skin = await Filter.find();

    res.json(skin);
  } catch (error) {
    next(error);
  }
};

async function syncBrands(products) {
  try {
    const brandsSet = new Set();

    // Збираємо унікальні бренди з товарів
    products.forEach((product) => {
      if (product.brand) {
        brandsSet.add(product.brand);
      }
    });

    // Перетворюємо в масив
    const uniqueBrands = Array.from(brandsSet);

    for (const brandName of uniqueBrands) {
      const slug = slugify(brandName, { lower: true, strict: true });

      // Перевіряємо, чи бренд уже існує
      const existingBrand = await BrandTorgsoft.findOne({ name: brandName });

      if (!existingBrand) {
        // Знаходимо найбільший існуючий numberId
        const lastBrand = await BrandTorgsoft.findOne()
          .sort({ numberId: -1 })
          .select("numberId");

        const newNumberId = lastBrand ? lastBrand.numberId + 1 : 1; // Призначаємо наступний ID

        // Створюємо новий бренд
        await BrandTorgsoft.create({
          name: brandName,
          slug,
          numberId: newNumberId,
        });
      } else {
        // Оновлюємо існуючий бренд (slug може змінитися)
        existingBrand.slug = slug;
        await existingBrand.save();
      }
    }

    console.log("Синхронізація брендів завершена.");
  } catch (error) {
    console.error("Помилка синхронізації брендів:", error);
  }
}

export function generateBreadcrumbs(categories, product, volume) {
  const breadcrumbs = [{ name: "Silvago", slug: "/" }];

  // Додаємо "Каталог" до хлібних крихт
  breadcrumbs.push({ name: "Каталог", slug: "/catalog" });

  // Сортуємо категорії за `idTorgsoft`, щоб забезпечити правильний порядок
  const sortedCategories = categories.sort(
    (a, b) => a.idTorgsoft - b.idTorgsoft
  );

  // Формуємо хлібні крихти на основі готових slug
  let slugPath = "/catalog";
  sortedCategories.forEach((category) => {
    slugPath = `${slugPath}/${category.slug}`;
    breadcrumbs.push({
      name: category.name,
      slug: slugPath,
    });
  });

  // Додаємо бренд до останньої категорії
  if (product.brand) {
    const brandSlug = `${slugPath}-${product.brand
      .toLowerCase()
      .replace(/\s/g, "-")}`;
    breadcrumbs.push({
      name: `${sortedCategories[sortedCategories.length - 1].name} ${
        product.brand
      }`,
      slug: brandSlug,
    });
  }

  // Додаємо інформацію про товар
  breadcrumbs.push({
    name: volume.fullName,
    slug: null, // Останній елемент не має посилання
  });

  return breadcrumbs;
}
