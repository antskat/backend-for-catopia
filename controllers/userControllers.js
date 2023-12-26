import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModel from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

export const register = async (req, res) => {
    console.log(req.body);
    console.log(req.body.password);
    try {
      const existingUser = await UserModel.findOne({ email: req.body.email });
  
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken.' });
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

    const isValidPass = await bcrypt.compare(req.body.password, user._doc.password);

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
    const { passwordHash, ...userData } = user._doc;

    res.json(userData);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Haven't got access",
    });
  }
};
