import { model, Schema } from "mongoose";
import slugify from "slugify";

// Схема для вкладених дочірніх категорій
const subCategorySchema = new Schema(
  {
    idTorgsoft: { type: Number, required: true }, // ID категорії
    name: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    children: [
      {
        type: Schema.Types.Mixed, // Дозволяє рекурсивну структуру
        default: [],
      },
    ],
  },
  { _id: true } // Додаємо автоматичне створення _id для вкладених категорій
);

// Основна схема для категорій
const categorySchema = new Schema({
  idTorgsoft: { type: Number, required: true }, // ID категорії
  name: { type: String, required: true }, // Назва категорії
  slug: { type: String, unique: true, required: true }, // Унікальний slug
  children: [subCategorySchema], // Використовуємо вкладену схему
});

// Middleware для створення slug перед збереженням
categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Модель категорії
const CategoryTorg = model("categoryTorgsoft", categorySchema);

export default CategoryTorg;
