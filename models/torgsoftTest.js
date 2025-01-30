import { model, Schema } from "mongoose";

const variationSchema = new Schema({
  idTorgsoft: { type: Number, required: true, unique: true }, // ID з TorgSoft
  fullName: { type: String, required: true }, // Назва товару

  volume: { type: Number, required: true }, // Об'єм, наприклад "1 мл", "30 мл"
  tone: { type: Number, required: false }, // Тон, наприклад "№23" або "№21"
  retailPrice: { type: Number, required: true }, // Ціна
  discountPrice: { type: Number, required: false }, // Ціна зі знижкою (опціонально)
  discount: { type: Number, required: false }, // Знижка у відсотках
  quantity: { type: Number, required: true, default: 0 }, // Кількість в наявності
  barcode: { type: String, required: true }, // Унікальний штрихкод
  slug: { type: String, required: true, unique: true }, // Унікальний slug
  image: { type: String, required: false }, // Фото для конкретної варіації
  images: [{ type: String, required: false }], // колекція фото
  isDefault: { type: Boolean, default: false }, // Чи є цей об'єм дефолтним
});

const productSchema = new Schema({
  modelName: { type: String, required: true }, // Назва моделі
  modelId: { type: Number, required: true, unique: true }, // ID моделі
  brand: { type: String, required: true }, // Бренд
  country: { type: String, required: true }, // Країна виробник
  categories: [
    {
      idTorgsoft: { type: Number, required: true, unique: true },
      name: { type: String, required: true },
      slug: { type: String, required: true }, // Додаємо slug
    },
  ], // Категорії
  variations: [variationSchema], // Варіації товару (об'єми/тони)
  skinNeeds: { type: String, required: false },
});
const Goods = model("goods", productSchema);

export default Goods;
