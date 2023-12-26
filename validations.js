import { body } from "express-validator";

export const registerValidation = [
    body("email", "Incorrect email").isEmail(),
    body("name", "Incorrect name").isLength({ min: 3, max: 10 }),
    body("password", "Incorrect password").isLength({ min: 5, max: 15 }),
    body("repPassword", "Incorrect repeat password").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Repeat password is incorrect");
        }
        return true;
    }),
]

export const loginValidation = [
    body("email", "Incorrect email").isEmail(),
    body("password", "Incorrect password").isLength({ min: 5, max: 15 }),
]