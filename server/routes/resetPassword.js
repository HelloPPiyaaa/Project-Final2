const express = require("express");
const User = require("../models/user");
const Admin = require("../models/admin"); // เพิ่มการใช้ Admin model
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();

router.post("/:type/:id/:token", async (req, res) => {
  const { id, token, type } = req.params;
  const { password } = req.body;

  jwt.verify(token, "jwt_secret_key", (err, decoded) => {
    if (err) {
      return res.json({ Status: "Error with token" });
    } else {
      bcrypt
        .hash(password, 10)
        .then((hash) => {
          // ตรวจสอบว่าประเภทเป็น user หรือ admin แล้วอัปเดตรหัสผ่าน
          const model = type === "admin" ? Admin : User; // เลือก model ที่เหมาะสม

          model
            .findByIdAndUpdate({ _id: id }, { password: hash })
            .then((u) => res.send({ Status: "Success" }))
            .catch((err) => res.send({ Status: err.message }));
        })
        .catch((err) => res.send({ Status: err.message }));
    }
  });
});

module.exports = router;
