const express = require("express");
const Booking = require("../models/booking.model");
const router = express.Router();

router.get("/dashboard", async (req, res) => {
  const bookings = await Booking.find({ status: "completed" }).populate("walker wanderer");
  const totalCommission = bookings.reduce((sum, b) => sum + (b.commission || 0), 0);
  res.render("layout", { bookings, totalCommission });
});

module.exports = router;
