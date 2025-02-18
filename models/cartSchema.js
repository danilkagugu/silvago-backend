import { Schema, model } from "mongoose";

const cartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      productId: { type: Schema.Types.ObjectId, ref: "Goods", required: true },
      idTorgsoft: { type: Number, required: true },
      slug: { type: String, required: true },
      quantity: { type: Number, required: true, default: 1 },
      addedAt: { type: Date, default: Date.now },
    },
  ],
  orderNumber: { type: Number, unique: true },
  totalPrice: { type: Number, default: 0 }, // 🛠 Додаємо `default: 0`
  customerInfo: {
    firstName: { type: String, required: false }, // ❌ НЕ обов'язкове поле
    lastName: { type: String, required: false },
    email: { type: String, required: false },
    phone: { type: String, required: false },
    address: { type: String, required: false },
  },
  paymentMethod: { type: String, enum: ["cash", "card"], required: false }, // ❌ НЕ обов'язкове
  deliveryMethod: {
    type: String,
    enum: ["courier", "pickup"],
    required: false,
  }, // ❌ НЕ обов'язкове
  status: { type: String, enum: ["active", "ordered"], default: "active" },
  createdAt: { type: Date, default: Date.now },
});

const Cart = model("cart", cartSchema);
export default Cart;
