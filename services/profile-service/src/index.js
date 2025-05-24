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

// Profile Schema
const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  bio: { type: String, default: "" },
  avatar: { type: String, default: "" },
  name: { type: String, default: "" },
  location: { type: String, default: "" },
  website: { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now },
});

const Profile = mongoose.model("Profile", profileSchema);

// Validation middleware
const validateProfile = [
  body("bio").optional().trim(),
  body("avatar").optional().trim(),
  body("name").optional().trim(),
  body("location").optional().trim(),
  body("website").optional().trim(),
];

// Routes
app.post("/profile", verifyToken, validateProfile, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bio, avatar, name, location, website } = req.body;

    let profile = await Profile.findOne({ userId: req.userId });

    if (profile) {
      return res.status(400).json({ message: "Profile already exists" });
    }

    profile = new Profile({
      userId: req.userId,
      bio,
      avatar,
      name,
      location,
      website,
    });

    await profile.save();
    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/profile", verifyToken, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/profile", verifyToken, validateProfile, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bio, avatar, name, location, website } = req.body;

    const profile = await Profile.findOne({ userId: req.userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    if (bio) profile.bio = bio;
    if (avatar) profile.avatar = avatar;
    if (name) profile.name = name;
    if (location) profile.location = location;
    if (website) profile.website = website;

    profile.updatedAt = Date.now();
    await profile.save();

    res.json(profile);
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

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Profile service running on port ${PORT}`);
});
