import { model, Schema } from "mongoose";
import slugify from "slugify";

// Схема для категорій з вкладеними дочірніми категоріями
const categorySchema = new Schema({
  name: { type: String, required: true }, // Назва категорії
  slug: { type: String, unique: true, required: true }, // Унікальний slug
  children: [
    {
      name: { type: String, required: true },
      slug: { type: String, unique: true, required: true },
      children: [
        {
          type: Schema.Types.Mixed, // Рекурсивна структура
          default: [],
        },
      ],
    },
  ],
});

// Модель категорії
const CategoryTorg = model("categoryTorgsoft", categorySchema);

export default CategoryTorg;
