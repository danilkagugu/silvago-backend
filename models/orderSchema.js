import { model, Schema } from "mongoose";

const orderSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  user: {
    name: { type: String, required: true },
    serName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: {
      area: { type: String, required: true },
      city: { type: String, required: true },
      office: { type: String, required: true },
    },
  },
  basket: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      productName: {
        type: String,
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
  totalAmount: { type: String },
  status: { type: String, default: "Pending" },
});

const Order = model("order", orderSchema);

export default Order;
