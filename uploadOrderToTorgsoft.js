import ftp from "basic-ftp";
import fs from "fs";
import path from "path";
const { FTP_USER_TORGSOFT, FTP_PASS_TORGSOFT } = process.env;

export async function uploadOrderToFTP(order) {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    // Шлях до папки orders
    const ordersFolder = path.resolve(
      "C:/Users/home/Documents/GitHub/silvago-backend/orders"
    );

    // Перевіряємо, чи існує папка orders, і створюємо її, якщо її немає
    // if (!fs.existsSync(ordersFolder)) {
    //   fs.mkdirSync(ordersFolder, { recursive: true });
    //   console.log(`📂 Папка створена: ${ordersFolder}`);
    // }

    // Шлях до файлу
    const filePath = path.join(
      ordersFolder,
      `order-${order.Options.OrderNumber}.json`
    );

    // Зберігаємо файл JSON
    fs.writeFileSync(filePath, JSON.stringify(order, null, 2));
    console.log(`✅ Файл замовлення сформовано: ${filePath}`);

    // Підключення до FTP-сервера
    await client.access({
      host: "127.0.0.1", // Ваш FTP-сервер
      user: "Torgsoft", // Логін для Torgsoft
      password: "125012001Torgsoft", // Пароль
      secure: false,
    });

    console.log("✅ Підключено до FTP");

    // Завантаження файлу замовлення
    await client.uploadFrom(
      filePath,
      `/order-${order.Options.OrderNumber}.json`
    );
    console.log("✅ Файл замовлення успішно завантажено до FTP");

    // Видалення локального файлу після завантаження
    // fs.unlinkSync(filePath);
    console.log("🗑️ Локальний файл видалено.");
  } catch (err) {
    console.error("🚨 Помилка завантаження файлу на FTP:", err);
  } finally {
    client.close();
  }
}
