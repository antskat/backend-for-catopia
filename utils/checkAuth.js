import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export default (req, res, next) => {
  const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      req.userId = decoded._id;
      next();
    } catch (err) {
      return res.status(403).json({ message: "Not authorized" });
    }
  } else {
    return res.status(403).json({ message: "Not authorized" });
  }
};
