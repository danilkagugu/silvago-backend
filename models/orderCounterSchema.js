import { model, Schema } from "mongoose";

// Модель для зберігання кількості замовлень
const orderCounterSchema = new Schema({
  count: { type: Number, default: 0 },
});

const OrderCounter = model("OrderCounter", orderCounterSchema);

export default OrderCounter;
