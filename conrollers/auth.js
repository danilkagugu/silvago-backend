import User from "../models/user.js";
import HttpError from "../helpers/HttpError.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
const { SECRET_KEY, REFRESH_SECRET_KEY } = process.env;

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) throw HttpError(409, "Email in use");
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ ...req.body, password: hashPassword });
    res.status(201).json({ user: { id: newUser._id, email: newUser.email } });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw HttpError(401, "Email or password is wrong");

  const comparePassword = await bcrypt.compare(password, user.password);

  if (!comparePassword) throw HttpError(401, "Email or password is wrong");

  const token = jwt.sign(
    {
      id: user._id,
    },
    SECRET_KEY,
    { expiresIn: "10h" }
  );

  const refreshToken = jwt.sign(
    {
      id: user._id,
    },
    REFRESH_SECRET_KEY,
    { expiresIn: "23h" }
  );

  await User.findByIdAndUpdate(
    user._id,
    { token, refreshToken },
    { new: true }
  );

  res.status(201).json({
    token,
    refreshToken,
    user: {
      name: user.name,
      serName: user.serName,
      phone: user.phone,
      email: user.email,
      password: user.password,
    },
  });
};

export const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { token: null }, { new: true });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
