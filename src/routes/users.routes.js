const express = require("express");
const auth = require("../middleware/auth.middleware");
const User = require("../models/user.model");
const router = express.Router();

router.post("/updateLocation", (req, res) => {
  const { lat, lng } = req.body;
  if (!lat || !lng) return res.status(400).json({ error: "Missing coords" });

  console.log(`📡 Background location received: ${lat}, ${lng}`);
  res.json({ success: true });
});
router.post("/updateLocation", (req, res) => {
  const { lat, lng } = req.body;
  if (!lat || !lng) return res.status(400).json({ error: "Missing coords" });
  console.log(`📍 Foreground location: ${lat}, ${lng}`);
  res.json({ success: true });
});
// update location
router.put("/location", auth, async (req, res) => {
  try {
    const { lng, lat } = req.body;
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

// get nearby walkers
router.get("/nearby", async (req, res) => {
  try {
    const { lng, lat, radius = 5 } = req.query;
    const walkers = await User.find({
      role: "walker",
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius) * 1000
        }
      }
    }).limit(10);
    res.json(walkers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
