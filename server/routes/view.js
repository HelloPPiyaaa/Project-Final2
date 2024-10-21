const express = require("express");
const router = express.Router();
const View = require("../models/view");

router.get("/", async (req, res) => {
  try {
    const views = await View.find().lean();
    res.status(200).json(views);
  } catch (err) {
    console.error("Error fetching view data:", err);
    res.status(500).json({ error: "Error fetching view data" });
  }
});

router.get("/:blogId", async (req, res) => {
  try {
    const { blogId } = req.params;
    const views = await View.find({ blogId }).lean();
    if (views.length === 0) {
      return res.status(404).json({ message: "No views found for this blog" });
    }
    res.status(200).json(views);
  } catch (err) {
    console.error("Error fetching view data by blogId:", err);
    res.status(500).json({ error: "Error fetching view data" });
  }
});

module.exports = router;
