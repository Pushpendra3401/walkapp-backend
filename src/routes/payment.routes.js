const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const auth = require("../middleware/auth.middleware");
const Wallet = require("../models/wallet.model");
const Booking = require("../models/booking.model");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create order
router.post("/create-order", auth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ message: "Amount required" });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Verify payment and add to wallet
router.post("/verify", auth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature)
      return res.status(400).json({ message: "Invalid signature" });

    let wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) wallet = await Wallet.create({ user: req.user.id, balance: 0 });

    wallet.balance += amount;
    wallet.transactions.push({
      type: "credit",
      amount,
      description: "Wallet top-up via Razorpay",
    });

    await wallet.save();
    res.json({ success: true, wallet });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Payout after completed booking
router.post("/payout", auth, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate("walker wanderer");
    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    const commissionRate = parseFloat(process.env.PLATFORM_COMMISSION || 0.15);
    const commission = booking.amount * commissionRate;
    const walkerEarnings = booking.amount - commission;

    // Deduct from wanderer
    const wandererWallet = await Wallet.findOne({ user: booking.wanderer._id });
    if (!wandererWallet || wandererWallet.balance < booking.amount)
      return res
        .status(400)
        .json({ message: "Insufficient wanderer wallet balance" });

    wandererWallet.balance -= booking.amount;
    wandererWallet.transactions.push({
      type: "debit",
      amount: booking.amount,
      description: `Payment for booking ${booking._id}`,
    });
    await wandererWallet.save();

    // Credit walker
    let walkerWallet = await Wallet.findOne({ user: booking.walker._id });
    if (!walkerWallet)
      walkerWallet = await Wallet.create({ user: booking.walker._id, balance: 0 });

    walkerWallet.balance += walkerEarnings;
    walkerWallet.transactions.push({
      type: "credit",
      amount: walkerEarnings,
      description: `Earnings from booking ${booking._id}`,
    });
    await walkerWallet.save();

    booking.commission = commission;
    booking.status = "completed";
    await booking.save();

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
