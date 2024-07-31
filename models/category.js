import { model, Schema } from "mongoose";

const itemSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
});

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  items: [itemSchema],
});

const Category = model("category", categorySchema);

export default Category;
