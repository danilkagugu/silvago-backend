import { Schema, model } from "mongoose";

const brandSchema = new Schema({
  name: { type: String, required: true, unique: true }, // Назва бренду
  slug: { type: String, required: true, unique: true }, // URL-friendly версія
  logo: { type: String, required: false }, // URL логотипу (опційно)
  numberId: { type: Number, required: true, unique: true }, // Унікальний числовий ID
});

const BrandTorgsoft = model("BrandTorgsoft", brandSchema);

export default BrandTorgsoft;
