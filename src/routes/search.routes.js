const express = require("express");
const User = require("../models/user.model");
const router = express.Router();

router.get("/", async (req, res) => {
  const { q } = req.query;
  const users = await User.find({
    role: "walker",
    name: { $regex: q || "", $options: "i" }
  }).limit(10);
  res.json(users);
});

module.exports = router;
