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
    },
  ],
});

const FavoriteProduct = model("favoritesProducts", favoritesProductsSchema);

export default FavoriteProduct;
