import { model, Schema } from "mongoose";

const favoritesProductsSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  products: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      productName: {
        type: String,
      },
      productPrice: {
        type: Number,
      },
      image: {
        type: String,
      },
      volume: {
        type: Number, // зберігаємо об'єм, наприклад, 50 мл
        required: true,
      },
      volumeId: {
        type: String,
        required: true,
      },
      price: {
        type: Number, // зберігаємо ціну для конкретного об'єму
        required: true,
      },
      discount: {
        type: Number,
        default: 0,
      },
      slug: {
        type: String,
        unique: true,
      },
      quantityInStock: {
        type: Number, // зберігаємо об'єм, наприклад, 50 мл
        required: true,
      },
    },
  ],
});

const FavoriteProduct = model("favoritesProducts", favoritesProductsSchema);

export default FavoriteProduct;
