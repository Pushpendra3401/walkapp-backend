const express = require("express");
const Booking = require("../models/booking.model");
const auth = require("../middleware/auth.middleware");

module.exports = (io) => {
  const router = express.Router();

  router.post("/", auth, async (req, res) => {
    try {
      const { walkerId, amount, start, end, distance, duration } = req.body;
      const booking = await Booking.create({
        wanderer: req.user.id,
        walker: walkerId,
        amount,
        location: { start, end },
        distance,
        duration
      });
      io.emit("bookingCreated", booking);
      res.status(201).json(booking);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.put("/:id/status", auth, async (req, res) => {
    try {
      const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
      io.emit("bookingStatusUpdated", booking);
      res.json(booking);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};
