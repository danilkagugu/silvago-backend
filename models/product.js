import { model, Schema } from "mongoose";

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  subcategory: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
  },
  country: {
    type: String,
    // enum: ["korea", "ukraine", "polsha", "usa", "italy"],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },

  quantity: {
    type: Number,
    default: 0,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
});

const Product = model("product", productSchema);

export default Product;
