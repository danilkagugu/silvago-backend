import { model, Schema } from "mongoose";

const basketSchema = new Schema({
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
      price: {
        type: Number,
        // required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      volume: {
        type: Number, // додано поле для об'єму
        required: true,
      },
    },
  ],
});

const Basket = model("basket", basketSchema);

export default Basket;
