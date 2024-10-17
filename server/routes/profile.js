const express = require("express");
const router = express.Router();
const User = require("../models/user");

// Route URL to get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}).lean();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching user data" });
  }
});

// Route URL to get user data by ID
router.get("/:id", async function (req, res, next) {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching user data" });
  }
});

router.post("/edit-profile/update/:id", async (req, res) => {
  const userId = req.params.id;
  const userData = req.body;

  if (req.file) {
    userData.profile_picture = req.file.path;
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, userData, {
      new: true,
    });
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).send("Internal server error");
  }
});

// Route URL to delete user profile by ID
router.delete("/edit-profile/delete/:id", async function (req, res, next) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting user" });
  }
});

router.post("/changepassword", async (req, res) => {
  try {
    const user = await User.findById(req.body._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.password = req.body.password;
    user.save();

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting user" });
  }
});

module.exports = router;
