const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt"); // Import bcrypt
const User = require("./models/user"); // Import your User model

const app = express();
require("dotenv").config();

const port = process.env.PORT || 3001;
const uri = process.env.ATLAS_URI;
console.log("JWT_SECRET:", process.env.JWT_SECRET);

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }
  res.json({ imageUrl: `http://localhost:3001/uploads/${req.file.filename}` });
});

app.post("/uploads", upload.array("files"), (req, res) => {
  console.log("Uploaded files:", req.files);

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files uploaded." });
  }

  const fileUrls = req.files.map(
    (file) => `http://localhost:3001/uploads/${file.filename}`
  );
  res.json({ fileUrls });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ensure admin account exists when server starts
const ensureAdminExists = async () => {
  try {
    const adminExists = await User.findOne({ is_admin: true });

    if (!adminExists) {
      const adminPassword = process.env.ADMIN_PASSWORD;

      // Ensure admin password is present
      if (!adminPassword) {
        throw new Error(
          "Admin password is not defined in environment variables"
        );
      }

      // Hash the admin password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const adminUser = new User({
        username: process.env.ADMIN_USERNAME,
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        firstname: "Admin",
        lastname: "User",
        is_admin: true,
      });

      await adminUser.save();
      console.log("Admin account created");
    } else {
      console.log("Admin already exists");
    }
  } catch (err) {
    console.error("Error checking/creating admin:", err);
  }
};

// Register routes
const registerRouter = require("./routes/register");
const loginRouter = require("./routes/login");
const profileRouter = require("./routes/profile");
const AdminRegister = require("./routes/adminRegister");
const postRouter = require("./routes/post");
const AdminProfile = require("./routes/adminProfile");
const ForgotPassword = require("./routes/forgotPassword");
const chatRouter = require("./routes/chat");
const messageRouter = require("./routes/message");
const find = require("./routes/find");
const resetPasswordRouter = require("./routes/resetPassword");
const FollowUser = require("./routes/follow");
const notificationRouter = require("./routes/notifications");
const questionRouter = require("./routes/QuestionRoutes");
const reportRouter = require("./routes/reports");

app.use("/notifications", notificationRouter);
app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/profile", profileRouter);
app.use("/posts", postRouter);
app.use("/forgot-password", ForgotPassword);
app.use("/chats", chatRouter);
app.use("/messages", messageRouter);
app.use("/users", find);
app.use("/reset_password", resetPasswordRouter);
app.use("/follow", FollowUser);
app.use("/admin", AdminProfile);
app.use("/admin/register", AdminRegister);
app.use("/api/questions", questionRouter);
app.use("/api/report", reportRouter);

// Connect to MongoDB and ensure admin exists
mongoose
  .connect(uri)
  .then(() => {
    console.log("MongoDB connection established");
    ensureAdminExists(); // Check or create admin when server starts
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => console.log("MongoDB connection failed: ", error.message));