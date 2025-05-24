const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

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

// Comment Schema
const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  blogId: { type: mongoose.Schema.Types.ObjectId, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Comment = mongoose.model("Comment", commentSchema);

// Validation middleware
const validateComment = [
  body("content").notEmpty().trim(),
  body("blogId").notEmpty(),
];

// Routes
app.post("/comments", verifyToken, validateComment, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, blogId } = req.body;
    const comment = new Comment({
      content,
      blogId,
      author: req.userId,
    });

    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/comments/blog/:blogId", async (req, res) => {
  try {
    const comments = await Comment.find({ blogId: req.params.blogId }).sort({
      createdAt: -1,
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/comments/:id", verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.author.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    await comment.remove();
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Database connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Comment service running on port ${PORT}`);
});
