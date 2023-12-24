import { body } from "express-validator";

export const loginValidation = [
    body("password", "Incorrect password").isLength({ min: 8, max: 32 }),
]

export const registerValidation = [
    body("email", "Incorrect email").isEmail(),
    body("password", "Incorrect password").isLength({ min: 8, max: 32 }),
    body("repPassword", "Incorrect repeat password").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Repeat password is incorrect");
        }
        return true;
    }),
    body("userName", "Incorrect username").isLength({ min: 3, max: 15 }),
    body("phone", "Incorrect phone").isMobilePhone(),
]