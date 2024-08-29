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
    },
  ],
});

const FavoriteProduct = model("favoritesProducts", favoritesProductsSchema);

export default FavoriteProduct;
