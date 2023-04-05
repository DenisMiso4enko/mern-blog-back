import chalk from "chalk";
import { Router } from "express";
import { UserModel } from "../models/User.js";
import { classToken } from "../service/token.service.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "config";

export const userRouter = Router({ mergeParams: true });

userRouter.post("/signUp", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existedUser = await UserModel.findOne({ name, email });
    if (existedUser) {
      res
        .status(400)
        .json({ message: "Пользователь с таким email и name уже существует" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await UserModel.create({
      ...req.body,
      password: hashedPassword,
    });

    const tokens = classToken.generate({ _id: newUser._id });
    await classToken.save(newUser._id, tokens.refreshToken);

    res.status(201).json({ ...tokens, user: newUser });
  } catch (error) {
    console.log(chalk.red(error));
    res.status(500).json({ message: "Server error" });
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      res.status(400).json({ message: "Пользователь не найден" });
    }
    const isPasswordEqual = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordEqual) {
      return res.status(400).json({ message: "INVALID_PASSWORD" });
    }

    const tokens = classToken.generate({ _id: existingUser._id });
    await classToken.save(existingUser._id, tokens.refreshToken);

    res.status(200).json({ ...tokens, user: existingUser });
  } catch (error) {
    console.log(chalk.red(error));
    res.status(500).json({ message: "Server error" });
  }
});

userRouter.post("/profile", async (req, res) => {
  try {
    // const token = req.headers.authorization.split(" ")[1];
    const { token } = req.body;
    if (token) {
      // const decoded = classToken.validateAccess(token);
      const decoded = jwt.verify(token, config.get("accessSecret"));
      const user = await UserModel.findById(decoded._id);

      const tokens = await classToken.generate({ _id: user._id });
      await classToken.save(user._id, tokens.refreshToken);
      res.status(200).json({ ...tokens, user });
    } else {
      res.status(400).json({ message: "No token" });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: `${e}` });
  }
});

// refreshToken;
userRouter.post("/token", async (req, res) => {
  try {
    const { refresh_token: refreshToken } = req.body;
    //  в дате id пользователя к которому прекреплен токен
    const data = classToken.validateRefresh(refreshToken);
    const dbToken = await classToken.findToken(refreshToken);

    const user = await UserModel.findById(data._id);

    if (!data || !dbToken || data._id !== dbToken?.user?.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const tokens = classToken.generate({ _id: data._id });

    await classToken.save(data._id, tokens.refreshToken);

    res.status(200).send({ ...tokens, user });
  } catch (e) {
    console.log(chalk.red(e));
    res.status(500).json({
      message: "На сервере произошла ошибка, попробуйте позже",
    });
  }
});
