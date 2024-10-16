const express = require("express");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();

router.post("/:id/:token", async (req, res) => {
  const { newPassword } = req.body;
  const { userId, token } = req.params;

  if (!newPassword) {
    return res.status(400).send({ message: "New Password is required" });
  }

  // ตรวจสอบโทเค็น
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Invalid or expired token" });
    }

    // ค้นหาผู้ใช้ตาม ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // แฮชรหัสผ่านใหม่และบันทึก
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword; // ปรับปรุงรหัสผ่านในฐานข้อมูล
    await user.save();

    return res.status(200).send({ message: "Password has been reset successfully" });
  });
});

module.exports = router;