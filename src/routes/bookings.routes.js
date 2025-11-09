const express = require("express");
const Booking = require("../models/booking.model");
const auth = require("../middleware/auth.middleware");

module.exports = (io) => {
  const router = express.Router();

  // Create booking
  router.post("/", auth, async (req, res) => {
    try {
      const { walkerId, amount, start, end, distance, duration } = req.body;
      if (!start || !end) return res.status(400).json({ message: "Missing locations" });

      const booking = await Booking.create({
        wanderer: req.user.id,
        walker: walkerId || null,
        amount: amount || 0,
        location: { start, end },
        distance,
        duration,
      });

      const socket = req.app.get("io");
      if (socket) socket.emit("bookingCreated", booking);
      res.status(201).json(booking);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Update booking status
  router.put("/:id/status", auth, async (req, res) => {
    try {
      const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
      const socket = req.app.get("io");
      if (socket) socket.emit("bookingStatusUpdated", booking);
      res.json(booking);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.get("/:id", auth, async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id).populate("walker wanderer");
      if (!booking) return res.status(404).json({ message: "Not found" });
      res.json(booking);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};
