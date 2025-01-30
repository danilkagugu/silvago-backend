import { model, Schema } from "mongoose";

const userShema = new Schema({
  firstName: { type: String, required: true, maxlength: 50 }, // Ім'я
  lastName: { type: String, required: true, maxlength: 50 }, // Прізвище
  middleName: { type: String, maxlength: 50 }, // По батькові (необов'язково)
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  discount: { type: Number, default: 0 },
  cardNumber: { type: String, unique: true, maxlength: 12 }, // Номер картки
  bonuses: { type: Number, default: 0 },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  token: {
    type: String,
    default: null,
  },
  refreshToken: {
    type: String,
    default: null,
  },
  country: {
    type: String,
  },
  region: {
    type: String,
  },
  city: {
    type: String,
  },
  address: {
    type: String,
  },
  role: { type: String, default: "client" },
  favorites: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Goods", // Зв'язок із колекцією товарів
        required: true,
      },
      idTorgsoft: {
        type: Number,
        required: true,
      },
      _id: false,
    },
  ],
});

const Client = model("client", userShema);

export default Client;
