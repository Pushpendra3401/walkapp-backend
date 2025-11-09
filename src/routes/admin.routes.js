const express = require("express");
const Booking = require("../models/booking.model");

const router = express.Router();

// Admin dashboard view (EJS)
router.get("/dashboard", async (req, res) => {
  try {
    const bookings = await Booking.find({ status: "completed" }).populate(
      "walker wanderer"
    );
    const totalCommission = bookings.reduce(
      (sum, b) => sum + (b.commission || 0),
      0
    );
    res.render("layout", { bookings, totalCommission });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
