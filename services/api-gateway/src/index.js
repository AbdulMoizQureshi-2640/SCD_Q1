const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const proxy = require("express-http-proxy");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Health check endpoints
app.get("/health", (req, res) => res.status(200).json({ status: "UP" }));
app.get("/ready", (req, res) => res.status(200).json({ status: "READY" }));

// JWT Verification Middleware
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Service URLs
const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://localhost:3001";
const BLOG_SERVICE_URL =
  process.env.BLOG_SERVICE_URL || "http://localhost:3002";
const COMMENT_SERVICE_URL =
  process.env.COMMENT_SERVICE_URL || "http://localhost:3003";
const PROFILE_SERVICE_URL =
  process.env.PROFILE_SERVICE_URL || "http://localhost:3004";

// Routes
app.use("/api/auth", proxy(AUTH_SERVICE_URL));

// Protected routes
app.use("/api/blogs", verifyToken, proxy(BLOG_SERVICE_URL));
app.use("/api/comments", verifyToken, proxy(COMMENT_SERVICE_URL));
app.use("/api/profile", verifyToken, proxy(PROFILE_SERVICE_URL));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
