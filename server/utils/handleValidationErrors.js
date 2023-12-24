import { validationResult } from "express-validator";

export default (reg, res, next) => {
  const errors = validationResult(reg);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }
  next();
};
