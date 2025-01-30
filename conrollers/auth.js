import User from "../models/user.js";
import HttpError from "../helpers/HttpError.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import csvParser from "csv-parser";
import fs from "fs";
import path from "path";
import Client from "../models/userTorgsoft.js";
import { fileURLToPath } from "url";
const { SECRET_KEY, REFRESH_SECRET_KEY } = process.env;

const generateUniqueCardNumber = async () => {
  const cardNumber = Math.floor(
    100000000000 + Math.random() * 900000000000
  ).toString();
  const existingClient = await Client.findOne({ cardNumber });
  if (existingClient) {
    return generateUniqueCardNumber(); // Якщо номер вже існує, генеруємо знову
  }
  return cardNumber;
};

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

export const registerClient = async (req, res, next) => {
  try {
    const { firstName, lastName, middleName, email, phone, password } =
      req.body;

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ message: "Заповніть всі необхідні поля" });
    }

    const existingClient = await User.findOne({ $or: [{ phone }, { email }] });
    if (existingClient) {
      return res.status(409).json({
        message: "Клієнт з таким email або номером телефону вже існує",
      });
    }

    if (existingClient) throw HttpError(409, "Email or phone in use");

    const torgsoftClients = await getTorgsoftClients();
    console.log("torgsoftClients: ", torgsoftClients);

    const torgsoftClient = torgsoftClients.find(
      (client) => client.phone === phone || client.email === email
    );

    let cardNumber = "";
    let bonuses = 0;

    if (torgsoftClient) {
      // 4️⃣ Якщо користувач знайдений у Torgsoft, витягуємо дані
      cardNumber = torgsoftClient.cardNumber;
      bonuses = torgsoftClient.bonuses;
    } else {
      // 5️⃣ Якщо немає картки Torgsoft, генеруємо новий номер картки
      cardNumber = generateUniqueCardNumber();
    }

    // const cardNumber = await generateUniqueCardNumber();

    const hashPassword = await bcrypt.hash(password, 10);

    const newClient = new Client({
      firstName,
      lastName,
      middleName,
      email,
      phone,
      password: hashPassword, // Хешуємо пароль
      cardNumber,
      bonuses,
    });

    await newClient.save();

    res.status(201).json({
      message: "Реєстрація успішна",
      client: {
        email: newClient.email,
        firstName: newClient.firstName,
        cardNumber: newClient.cardNumber,
        bonuses: newClient.bonuses,
      },
    });
  } catch (error) {
    next(error);
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getTorgsoftClients = () => {
  return new Promise((resolve, reject) => {
    const clients = [];
    const filePath = path.join(__dirname, "../dataBase/TSClients.trs"); // Шлях до файлу з Torgsoft

    fs.createReadStream(filePath)
      .pipe(csvParser({ separator: ";", headers: false }))
      .on("data", (row) => {
        const client = {
          name: row[0],
          email: row[1],
          phone: row[2].replace(/\D/g, ""), // Очищаємо телефон від зайвих символів
          cardNumber: row[5],
          bonuses: row[13] ? parseFloat(row[13].replace(",", ".")) : 0,
        };
        clients.push(client);
      })
      .on("end", () => {
        resolve(clients);
      })
      .on("error", (error) => {
        reject(error);
      });
    console.log("clients", clients);
  });
};

export const loginTorgsoft = async (req, res, next) => {
  const { email, password } = req.body;
  // console.log("passwords: ", password);
  // console.log("email: ", email);
  const user = await Client.findOne({ email });
  // console.log("user: ", user);
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

  await Client.findByIdAndUpdate(
    user._id,
    { token, refreshToken },
    { new: true }
  );

  res.status(201).json({
    token,
    refreshToken,
    user,
  });
};
export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  // console.log("user: ", user);
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
export const logoutClient = async (req, res, next) => {
  try {
    await Client.findByIdAndUpdate(req.user.id, { token: null }, { new: true });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

// export const registerClient = async (req, res, next) => {
//   try {
//     const { firstName, lastName, middleName, email, phone, password } =
//       req.body;

//     if (!firstName || !lastName || !email || !phone || !password) {
//       return res.status(400).json({ message: "Заповніть всі необхідні поля" });
//     }

//     const existingClient = await Client.findOne({ email });
//     if (existingClient) {
//       return res
//         .status(400)
//         .json({ message: "Клієнт з таким email вже існує" });
//     }

//     if (existingClient) throw HttpError(409, "Email in use");

//     const cardNumber = await generateUniqueCardNumber();

//     const hashPassword = await bcrypt.hash(password, 10);

//     const newClient = new Client({
//       firstName,
//       lastName,
//       middleName,
//       email,
//       phone,
//       password: hashPassword, // Хешуємо пароль
//       cardNumber,
//     });

//     await newClient.save();

//     res.status(201).json({
//       message: "Реєстрація успішна",
//       client: {
//         email: newClient.email,
//         firstName: newClient.firstName,
//         cardNumber: newClient.cardNumber,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };
