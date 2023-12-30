import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModel from "../models/User.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

let savedCode;
let userMail;

export const register = async (req, res) => {
  console.log(req.body);
  console.log(req.body.password);
  try {
    const existingUser = await UserModel.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(400).json({ message: "Email is already taken." });
    }

    const pass = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(pass, salt);

    const doc = new UserModel({
      email: req.body.email,
      name: req.body.name,
      password: hash,
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      process.env.JWT_KEY,
      {
        expiresIn: "30d",
      }
    );

    const { password, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Can't register",
    });
  }
};

export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isValidPass = await bcrypt.compare(
      req.body.password,
      user._doc.password
    );

    if (!isValidPass) {
      return res.status(400).json({
        message: "Invalid password or email",
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      process.env.JWT_KEY,
      {
        expiresIn: "30d",
      }
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Cant login",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Перевіряємо, чи є токен у заголовках і чи він співпадає з токеном користувача
    const token = req.header("Authorization");
    if (!token || !token.startsWith("Bearer ") || token.split(" ")[1] !== user.token) {
      console.log('Token not provided or invalid format');
      return res.status(401).json({
        message: "User not authorized",
      });
    }

    const { passwordHash, ...userData } = user._doc;
    res.json(userData);
    console.log('User authenticated:', req.userId);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Unable to get user data",
    });
  }
};

export const sendConfirm = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    
    userMail = req.body.email;

    function generateConfirmNumber() {
      return Math.floor(100000 + Math.random() * 900000).toString();
    }

    const code = generateConfirmNumber();
    const email = req.body.email;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    function sendEmail(email, code) {
      const options = {
        from: process.env.EMAIL,
        to: email,
        subject: "Confirm Email",
        text: `Your confirmation code is ${code}`,
      };
      transporter.sendMail(options, (error, info) => {
        if (error) {
          console.log(error);
          res.status(500).json({
            message: "Error sending confirmation email",
          });
        } else {
          console.log("Email sent: " + info.response);
          savedCode = code;
          res.json({
            message: "Confirmation email sent successfully",
            generatedCode: code,
          });
        }
      });
    }

    sendEmail(email, code);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const verifyCode = (req, res) => {
  console.log(req.body);
  const { userCode } = req.body;

  if (!userCode) {
    return res.status(400).json({
      message: "UserCode is required in the request.",
    });
  }

  // Базовая валидация: убедимся, что код состоит из 6 цифр
  const isValidCodeFormat = /^\d{6}$/.test(userCode);

  if (!isValidCodeFormat) {
    return res.status(400).json({
      message: "Invalid code format. Please enter a 6-digit code.",
    });
  }

  if (userCode === savedCode) {
    res.json({
      message: "Code verified successfully",
    });
  } else {
    res.status(400).json({
      message: "Incorrect code",
    });
  }
};

export const changePassword = async (req, res) => {
  console.log(userMail);
  try {
    const user = await UserModel.findOne({ email: userMail });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const newPassword = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    user.password = hash;
    await user.save();

    res.json({
      message: "Password changed successfully",
    })
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Cant change password",
    });
  }
};
