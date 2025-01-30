import { model, Schema } from "mongoose";

const orderSchema = new Schema(
  {
    orderNumber: { type: Number, unique: true },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    user: {
      fullName: { type: String, required: true },
      // lastName: { type: String, required: true },
      // middleName: { type: String },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      region: { type: String, required: true },
      city: { type: String, required: true },
      office: { type: String, required: true },
      comment: { type: String },
    },
    basket: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          ref: "goods",
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
        tone: { type: Number, required: false }, // Тон, наприклад "№23" або "№21"
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
