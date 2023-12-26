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
  res.header('Access-Control-Allow-Headers', 'Content-Type'); 
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
  "https://antskat.github.io/backend-for-catopia/login",
  loginValidation,
  handleValidationErrors,
  userController.login
);
app.post(
  "https://antskat.github.io/backend-for-catopia/register",
  registerValidation,
  handleValidationErrors,
  userController.register
);
app.get("https://antskat.github.io/backend-for-catopia/auth/me", checkAuth, userController.getMe);
