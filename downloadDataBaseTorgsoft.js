import ftp from "basic-ftp";
import fs from "fs";
import path from "path";
import Papa from "papaparse";
import Client from "./models/userTorgsoft.js";

const { FTP_USER_SILVAGO, FTP_PASS_SILVAGO } = process.env;

export async function downloadFiles() {
  const client = new ftp.Client();
  client.ftp.verbose = true; // Увімкнути докладний вивід у консоль

  try {
    // Підключення до FTP-сервера
    await client.access({
      host: "127.0.0.1", // Хост сервера
      user: FTP_USER_SILVAGO, // Логін
      password: FTP_PASS_SILVAGO, // Пароль
      secure: false, // Вимкнути захищений режим (SSL)
    });

    console.log("Підключено до FTP");
    const savePath = "C:/Users/home/Documents/GitHub/silvago-backend/dataBase";

    // Завантаження файлу TSGoods.trs
    await client.downloadTo(`${savePath}/TSGoods.trs`, "TSGoods.trs");
    console.log("Файл TSGoods.trs успішно завантажено до dataBase");

    // Завантаження файлу TSClients.trs
    await client.downloadTo(`${savePath}/TSClients.trs`, "TSClients.trs");
    console.log("Файл TSClients.trs успішно завантажено до dataBase");
  } catch (err) {
    console.error("Помилка під час завантаження файлів:", err);
  } finally {
    client.close(); // Закрити з'єднання
  }
}

export async function updateClientBonuses() {
  try {
    const filePath = path.resolve(
      "C:/Users/home/Documents/GitHub/silvago-backend/dataBase/TSClients.trs"
    );

    // Перевірка наявності файлу
    if (!fs.existsSync(filePath)) {
      console.error("🚨 Файл TSClients.csv не знайдено!");
      return;
    }

    // Читання файлу
    const fileContent = fs.readFileSync(filePath, "utf-8");

    // Парсинг CSV файлу
    const { data } = Papa.parse(fileContent, {
      header: false,
      skipEmptyLines: true,
    });

    console.log("✅ Дані з файлу завантажено:", data);

    // Оновлення бонусів у базі даних
    for (const row of data) {
      const email = row[1]?.trim(); // Email (2-й стовпець)
      const phone = row[2]?.replace(/\D/g, ""); // Номер телефону (3-й стовпець), нормалізуємо
      const bonuses = parseFloat(row[13].replace(",", ".")) || 0; // Бонуси (14-й стовпець)

      // Перевірка наявності email або телефону
      if (!email && !phone) {
        console.warn("🚨 Email та телефон відсутні, пропуск запису.");
        continue;
      }

      let updatedClient = null;

      // Оновлення за email
      if (email) {
        updatedClient = await Client.findOneAndUpdate(
          { email: email },
          { $set: { bonuses: bonuses } },
          { new: true }
        );
      }

      // Якщо за email не знайдено, оновлюємо за номером телефону
      if (!updatedClient && phone) {
        updatedClient = await Client.findOneAndUpdate(
          { phone: phone },
          { $set: { bonuses: bonuses } },
          { new: true }
        );
      }

      if (updatedClient) {
        console.log(
          `✅ Оновлено бонуси для клієнта: ${updatedClient.firstName} ${updatedClient.lastName}`
        );
      } else {
        console.warn(
          `⚠️ Клієнт з email: ${email || "N/A"} або телефоном: ${
            phone || "N/A"
          } не знайдений.`
        );
      }
    }

    console.log("🎉 Оновлення бонусів завершено!");
  } catch (error) {
    console.error("🚨 Помилка оновлення бонусів:", error);
  }
}
