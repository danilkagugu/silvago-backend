import { model, Schema } from "mongoose";

const orderSchema = new Schema({
  Client: {
    Name: { type: String, required: true },
    MPhone: { type: String, required: true },
    ZIP: { type: String },
    Country: { type: String, required: true },
    Region: { type: String },
    City: { type: String, required: true },
    Address: { type: String, required: true },
    EMail: { type: String },
  },
  Options: {
    SaleType: { type: String, required: true },
    Comment: { type: String },
    OrderNumber: { type: String, required: true },
    DeliveryCondition: { type: String },
    DeliveryAddress: { type: String },
    OrderDate: { type: Date, default: Date.now },
  },
  Goods: [
    {
      GoodID: { type: String, required: true },
      Price: { type: String, required: true },
      Count: { type: String, required: true },
    },
  ],
});

const OrderTorgsoft = model("order", orderSchema);

export default OrderTorgsoft;
