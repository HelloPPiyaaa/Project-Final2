const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Admin = require("../models/admin");
const User = require("../models/user");
const Post = require("../models/blog");
const jwt = require("jsonwebtoken");

//Admin
// router.get("/", async (req, res) => {
//   try {
//     const admins = await Admin.find({}).lean();
//     res.json(admins);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Error fetching user data" });
//   }
// });

const formDatatoSend = (user) => {
  const access_token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  return {
    access_token,
    _id: user._id,
    role: user.is_admin == true ? "admin" : "user",
    profile_picture: user.profile_picture,
    username: user.username,
    fullname: user.fullname,
  };
};

router.post("/", async (req, res) => {
  let { email, password } = req.body;

  console.log("Email:", email);
  console.log("Password:", password);

  try {
    const user = await Admin.findOne({ email: email });

    if (!user) {
      return res.status(403).json({ error: "ไม่พบผู้ใช้" });
    }
    if (password !== user.password) {
      return res.status(403).json({ error: "รหัสผ่านไม่ถูกต้อง" });
    }
    console.log("formDatatoSend(user)", formDatatoSend(user));
    return res.status(200).json(formDatatoSend(user));
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: "เกิดข้อผิดพลาดในระบบ" });
  }
});

// Middleware ตรวจสอบสิทธิ์ของแอดมิน
const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await User.findById(decoded.id);

    if (admin && admin.is_admin) {
      req.user = admin;
      next();
    } else {
      res.status(403).json({ message: "Access denied" });
    }
  } catch (error) {
    console.error("Error in isAdmin middleware:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 1. รับข้อมูลผู้ใช้ทั้งหมด (แอดมิน)
// router.get("/users", isAdmin, async (req, res) => {
//   try {
//     const userCount = await User.countDocuments();
//     console.log("userCount", userCount); // This logs the count on the server-side
//     res.json({ count: userCount });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

router.get("/users", async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    return res.json(userCount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/users/within24hour", async (req, res) => {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const userCount = await User.countDocuments({
      joinedAt: { $gte: twentyFourHoursAgo },
    });
    return res.json(userCount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/viewer", async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/blogs/within24hour", async (req, res) => {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const posts = await Post.find({
      publishedAt: { $gte: twentyFourHoursAgo },
    });

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/blogs/:id", async (req, res) => {
  const { id: user_id } = req.params;
  try {
    const posts = await Post.find({ author: user_id });
    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: "No posts found for this user" });
    }
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// 2. รับข้อมูลผู้ใช้ตาม ID (แอดมิน)
router.get("/users/:id", isAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// 3. อัปเดตข้อมูลผู้ใช้ (แอดมิน)
router.put("/users/:id", isAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, // ตรวจสอบค่าที่อัปเดต
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// 4. ลบบัญชีผู้ใช้ (แอดมิน)
router.delete("/users/:id", isAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error.message); // เพิ่มข้อความแสดงข้อผิดพลาด
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/:id", async function (req, res) {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(admin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching user data" });
  }
});

module.exports = router;
