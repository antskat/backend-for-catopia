import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path, { dirname } from "path";
import { registerValidation, loginValidation } from "./validations.js";
import handleValidationErrors from "./utils/handleValidationErrors.js";
import checkAuth from "./utils/checkAuth.js";
import * as userController from "./controllers/userControllers.js";
import * as postController from "./controllers/postControllers.js";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import { fileURLToPath } from 'url';

dotenv.config();
 
const app = express();

app.use(express.json());
app.use(cors());
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const avatarsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(avatarsPath));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload({}));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
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

app.get("/", (req, res) => {
  console.log("Hello World!");
  res.send("Hello World!");
})

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
app.post("/auth/me", checkAuth, userController.getMe);
app.post("/profile/upload", checkAuth, userController.uploadAvatar);
app.post("/forgot-password", userController.sendConfirm);
app.post("/confirm", userController.verifyCode);
app.post("/post/create", checkAuth, postController.createPost);

app.patch("/change-password", userController.changePassword);

app.delete("/profile/delete", checkAuth, userController.deleteAvatar);
app.delete("/post/:postId/delete", checkAuth, postController.deletePost);

app.get("/posts", postController.getPosts);
app.get("/getAvatar", checkAuth, userController.getAvatar);
app.get("/getUser", checkAuth, userController.getUser);