import { uploadOrderToFTP } from "./uploadOrderToTorgsoft.js";

const order = {
  Client: {
    Name: "Франко Іван Якович",
    MPhone: "0675746830",
    ZIP: "61072",
    Country: "Україна",
    Region: "Харківська",
    City: "Харків",
    Address: "вул. Гіршмана,16",
    EMail: "info@torgsoft.com.ua",
  },
  Options: {
    SaleType: "1",
    Comment: "Код під'їзду 1685",
    OrderNumber: "12",
    DeliveryCondition: "Нова Пошта",
    DeliveryAddress: "Харків, вул. Сумська, 124 (Відділення №33)",
    OrderDate: "2020-02-04 18:19:44",
  },
  Goods: [
    { GoodID: "38280", Price: "145.33", Count: "2" },
    { GoodID: "38281", Price: "131.61", Count: "1" },
  ],
};

// Викликаємо функцію
uploadOrderToFTP(order);
