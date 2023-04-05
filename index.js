import express from "express";
import cors from "cors";
import chalk from "chalk";
import config from "config";
import mongoose from "mongoose";
import { userRouter } from "./routes/User.js";
import multer from "multer";
import {postRouter} from "./routes/Posts.js";

const app = express();
const PORT = config.get("port") ?? 8080;

// папка со статичными файлами
app.use("/uploads", express.static("uploads"));

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

// routes
app.use("/user", userRouter);
app.use("/posts", postRouter)


// storage files
const storage = multer.diskStorage({
  // когда будет загружаться любой файл,   будет работать функция которая вернет путь файла
  destination: (_, __, cb) => {
    cb(null, "uploads");
  },
  // перед тем как сохранить функция укажет как называеться файл
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });
// запрос на загрузку
app.post('/posts/uploadImage', upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`
  })
})

async function start() {
  try {
    await mongoose.connect(config.get("mongoUrl"));
    console.log(chalk.green(`DB connect`));
    app.listen(PORT, () => {
      console.log(chalk.green(`Server has started on port ${PORT}...`));
    });
  } catch (e) {
    console.log(chalk.red(e.message));
    process.exit(1);
  }
}
start();
