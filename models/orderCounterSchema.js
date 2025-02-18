import { Schema, model } from "mongoose";

const orderCounterSchema = new Schema({
  orderNumber: { type: Number, required: true, default: 0 },
});

const OrderCounter = model("orderCounter", orderCounterSchema);
export default OrderCounter;
