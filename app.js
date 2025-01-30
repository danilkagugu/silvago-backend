import express from "express";
import morgan from "morgan";
import cors from "cors";
import router from "./routes/index.js";

const app = express();

import path from "path";
import { downloadFiles } from "./downloadDataBaseTorgsoft.js";

const photosFolder = path.resolve("C:\\TORGSOFT\\Photo");
app.use("/photos", express.static(photosFolder));

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/api", router);

app.get("/download-files", async (req, res) => {
  try {
    await downloadFiles();
    res.status(200).json({ message: "Файли успішно завантажено!" });
  } catch (error) {
    console.error("Помилка завантаження файлів:", error);
    res.status(500).json({ message: "Помилка завантаження файлів", error });
  }
});

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

export default app;
