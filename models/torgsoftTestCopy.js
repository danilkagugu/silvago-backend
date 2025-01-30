import { model, Schema } from "mongoose";

// Схема для об'ємів
const volumeSchema = new Schema({
  fullName: { type: String, required: true }, // Назва товару для одного з об'ємів
  idTorgsoft: { type: Number, required: true, unique: true }, // id з програми
  volume: { type: Number, required: false }, // Об'єм (наприклад, "150 мл")
  retailPrice: { type: Number, required: true }, // Роздрібна ціна
  discountPrice: { type: Number, required: false }, // Роздрібна ціна
  wholesalePrice: { type: Number, required: true }, // Оптова ціна
  quantity: { type: Number, required: true }, // Кількість
  barcode: { type: Number, required: false }, // Штрихкод
  photos: [{ type: String, required: false }], // Масив URL фотографій
  discount: { type: Number, required: false }, // Знижка
  tone: { type: Number, required: false }, // Об'єм (наприклад, "150 мл")
  slug: {
    type: String,
    unique: true,
    required: true,
  }, // Формування посилання
});

// Основна схема товару
const goodsSchema = new Schema({
  name: { type: String, required: true }, // Назва товару (спільна для всіх об'ємів)
  country: { type: String, required: true }, // Країна виробник
  categories: [{ type: String, required: true }], // Масив товару
  productTypeFull: { type: String, required: true }, // Вид товару повністю
  volumes: [volumeSchema], // Масив об'ємів з усіма їх параметрами
  brand: { type: String, required: true }, // Назва Бренду
});

const Goods = model("goods", goodsSchema);

export default Goods;
