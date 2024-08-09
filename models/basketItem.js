import { model, Schema } from "mongoose";

const basketItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
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
    default: 1,
    required: true,
  },
});

const BasketItem = model("basketItem", basketItemSchema);

export default BasketItem;
