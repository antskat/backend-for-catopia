import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export default (req, res, next) => {
  const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");
  console.log("Received token:", token);

  if (token) {
    try {
      console.log(process.env.JWT_KEY);
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      console.log(decoded);
      req.userId = decoded._id;
      next();
    } catch (err) {
      console.error("Error verifying token:", err);

      if (err.name === "JsonWebTokenError") {
        return res.status(403).json({ message: "Malformed token" });
      } else {
        return res.status(403).json({ message: "Not authorized" });
      }
    }
  } else {
    console.log("No token");
    return res.status(403).json({ message: "Not authorized" });
  }
};
