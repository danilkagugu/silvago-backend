import { model, Schema } from "mongoose";

const orderSchema = new Schema(
  {
    orderNumber: { type: Number, unique: true },
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
        price: {
          type: Number,
        },
        image: {
          type: String,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        volume: {
          type: Number,
          required: true,
        },
        discount: {
          type: Number,
          default: 0,
        },
      },
    ],
    totalAmount: { type: Number },
    status: { type: String, default: "Прийнято" },
    allQuantity: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const Order = model("order", orderSchema);

export default Order;
