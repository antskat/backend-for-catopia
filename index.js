import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { registerValidation, loginValidation } from "./validations.js";
import handleValidationErrors from "./utils/handleValidationErrors.js";
import checkAuth from "./utils/checkAuth.js";
import * as userController from "./controllers/userControllers.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); 
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); 
  res.header('Access-Control-Allow-Headers', 'Content-Type'); // Разрешенные заголовки
  next();
});

mongoose
  .connect(process.env.MONGO_DB)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log(err);
    console.log("MongoDB not connected");
  });

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

app.post(
  "/login",
  loginValidation,
  handleValidationErrors,
  userController.login
);
app.post(
  "/register",
  registerValidation,
  handleValidationErrors,
  userController.register
);
app.get("/auth/me", checkAuth, userController.getMe);
app.get("/", (req, res) => {
  console.log("Hello World!");
  res.send("Hello World!");
})

app.post("/forgot-password", userController.sendConfirm);
app.post("/confirm", userController.verifyCode);
app.patch("/change-password", userController.changePassword);