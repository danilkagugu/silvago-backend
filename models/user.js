import { model, Schema } from "mongoose";

const userShema = new Schema({
  name: {
    type: String,
  },
  serName: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
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
  area: {
    type: String,
  },
  city: {
    type: String,
  },
  office: {
    type: String,
  },
});

const User = model("user", userShema);

export default User;
