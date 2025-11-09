const express = require("express");
const auth = require("../middleware/auth.middleware");
const User = require("../models/user.model");
const router = express.Router();

router.post("/updateLocation", async (req, res) => {
  try {
    const { lat, lng, userId } = req.body;
    if (!lat || !lng) return res.status(400).json({ message: "Missing coordinates" });

    if (userId) {
      const user = await User.findByIdAndUpdate(
        userId,
        { location: { type: "Point", coordinates: [lng, lat] } },
        { new: true }
      );
      return res.json(user);
    }

    console.log(`📡 Received location: ${lat}, ${lng}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/location", auth, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { location: { type: "Point", coordinates: [lng, lat] } },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/nearby", async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;
    const walkers = await User.find({
      role: "walker",
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius) * 1000,
        },
      },
    }).limit(10);
    res.json({ count: walkers.length, walkers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
