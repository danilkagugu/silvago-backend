import { model, Schema } from "mongoose";

const basketSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  products: [
    {
      idTorgsoft: {
        type: Number,
        required: true,
      },
      productName: {
        type: String,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      quantityStock: {
        type: Number,
        // default: 1,
      },
      volume: {
        type: Number, // додано поле для об'єму
        required: true,
      },
      tone: { type: String, required: false }, // Тон, наприклад "№23" або "№21"
      slug: {
        type: String,
        required: true,
        // unique: true,
      },
      image: { type: String, required: true },
      discount: {
        type: Number,
        default: 0,
      },
      barcode: {
        type: String,
      },
    },
  ],
});

const Basket = model("basket", basketSchema);

export default Basket;
