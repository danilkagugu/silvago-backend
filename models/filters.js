import { Schema, model } from "mongoose";

const filterOptionSchema = new Schema({
  name: { type: String, required: true },
  value: { type: Number, required: true },
  slug: { type: String, required: true, unique: true }, // Унікальний slug
});

const filterSchema = new Schema({
  type: { type: String, required: true, unique: true }, // Наприклад, "skinNeeds"
  options: [filterOptionSchema], // Варіанти фільтрів
});

export const Filter = model("Filter", filterSchema);
