import { model, Schema } from "mongoose";

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  article: {
    type: Number,
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
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  characteristics: [
    {
      country: {
        type: String,
        required: true,
      },
      productClass: {
        type: String,
        required: true,
      },
      appointment: {
        type: String,
        required: true,
      },
      skinType: {
        type: String,
        required: true,
      },
      series: {
        type: String,
        required: true,
      },
      productType: {
        type: String,
        required: true,
      },
      age: {
        type: String,
        required: true,
      },
    },
  ],
  volumes: [
    {
      volume: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      discount: {
        type: Number,
        default: 0,
      },
    },
  ],

  salesCount: {
    type: Number,
    default: 0,
  },
});

const Product = model("product", productSchema);

export default Product;
