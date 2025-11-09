const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  wanderer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  walker: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["pending", "accepted", "completed", "cancelled"], default: "pending" },
  amount: { type: Number, required: true, default: 0 },
  commission: { type: Number, default: 0 },
  location: {
    start: { type: [Number], required: true },
    end: { type: [Number], required: true },
  },
  distance: { type: Number },
  duration: { type: Number },
  chatChannel: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
