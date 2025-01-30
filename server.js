import mongoose from "mongoose";
import app from "./app.js";
import "dotenv/config";
import FtpSrv from "ftp-srv";
import path from "path";
import {
  downloadFiles,
  updateClientBonuses,
} from "./downloadDataBaseTorgsoft.js";

const {
  DB_URI,
  PORT,
  FTP_PORT,
  FTP_USER_SILVAGO,
  FTP_PASS_SILVAGO,
  FTP_USER_TORGSOFT,
  FTP_PASS_TORGSOFT,
} = process.env;

mongoose.set("strictQuery", true);

async function run() {
  try {
    // Підключення до MongoDB
    await mongoose.connect(DB_URI);
    console.log("✅ Database connection successful");

    // Запуск HTTP-сервера
    app.listen(PORT, () => {
      console.log(`✅ HTTP-сервер запущено на http://localhost:${PORT}`);
    });

    // Ініціалізація FTP-сервера
    const ftpServer = new FtpSrv({
      url: "ftp://127.0.0.1:21",
      anonymous: false,
      pasv_url: "127.0.0.1",
      pasv_min: 1024,
      pasv_max: 1048,
    });

    // Шляхи до папок
    const shopFolder = path.resolve("C:\\Журнал Torgsoft");
    const torgsoftFolder = path.resolve(
      "C:\\Журнал Torgsoft\\Приймання замовлень\\3"
    );

    // Логіка доступу для різних користувачів
    ftpServer.on("login", ({ username, password }, resolve, reject) => {
      if (username === FTP_USER_SILVAGO && password === FTP_PASS_SILVAGO) {
        console.log(`✅ Успішний вхід для магазину: ${username}`);
        resolve({ root: shopFolder }); // Магазин отримує доступ до "C:\Журнал Torgsoft"
      } else if (
        username === FTP_USER_TORGSOFT &&
        password === FTP_PASS_TORGSOFT
      ) {
        console.log(`✅ Успішний вхід для Torgsoft: ${username}`);
        resolve({ root: torgsoftFolder }); // Torgsoft отримує доступ до "C:\Журнал Torgsoft\Приймання замовлень\3"
      } else {
        console.log(`🚫 Відмова у доступі для користувача: ${username}`);
        reject(new Error("Неправильний логін або пароль!"));
      }
    });

    // Запуск FTP-сервера
    ftpServer.listen().then(() => {
      console.log(`✅ FTP-сервер запущено на ftp://localhost:${FTP_PORT}`);
    });

    // 🕒 Автоматичне завантаження файлів кожні 60 секунд
    // setInterval(async () => {
    //   try {
    //     console.log("⏳ Запуск автоматичного завантаження файлів...");

    //     // 1️⃣ Завантаження файлів з FTP
    //     await downloadFiles();

    //     // 2️⃣ Оновлення бонусів клієнтів
    //     console.log("⏳ Оновлення бонусів клієнтів...");
    //     await updateClientBonuses();

    //     console.log("🎉 Автоматичне оновлення файлів та бонусів завершено.");
    //   } catch (error) {
    //     console.error(
    //       "🚨 Помилка під час автоматичного завантаження файлів або оновлення бонусів:",
    //       error
    //     );
    //   }
    // }, 60000); // кожні 60 секунд
  } catch (error) {
    console.error("🚨 Database connection failure:", error);
    process.exit(1);
  }
}

run();
