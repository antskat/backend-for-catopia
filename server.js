import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import bodyParser from "body-parser";
import { registerValidation, loginValidation } from "./server/validations.js";
import handleValidationErrors from "./server/utils/handleValidationErrors.js";
import checkAuth from "./server/utils/checkAuth.js";
import * as userController from "./server/controllers/userController.js";
import path from "path";

const __dirname = path.resolve();

const uri =
  "mongodb+srv://admin:roottoor@catopia.0ss3vvb.mongodb.net/main?retryWrites=true&w=majority";

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log("MongoDB connection error: ", err);
  });

const app = express();

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.post(
  "/catopia/login",
  loginValidation,
  handleValidationErrors,
  userController.login
);

app.post(
  "/catopia/register",
  registerValidation,
  handleValidationErrors,
  userController.register
);

app.get("/catopia/", (req, res) => {
  res.redirect("http://antskat.github.io/catopia/");
});

app.get("/catopia/auth/me", checkAuth, userController.getMe);

let port = 5000;
app.listen(port, (err) => {
  if (err) {
    console.log(err);
  }
  console.log(`Server is running on port ${port}`);
});
