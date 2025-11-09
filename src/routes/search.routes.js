const express = require("express");
const User = require("../models/user.model");

const router = express.Router();

// Search walkers by name (for Wanderer)
router.get("/", async (req, res) => {
  try {
    const { q } = req.query;
    const users = await User.find({
      role: "walker",
      name: { $regex: q || "", $options: "i" },
    })
      .limit(10)
      .select("name rating location profileImage");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
