const express = require("express");
const auth = require("../middleware/auth.middleware");
const Wallet = require("../models/wallet.model");

const router = express.Router();

// Get wallet details
router.get("/", auth, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });
    res.json(wallet || { user: req.user.id, balance: 0, transactions: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add money to wallet
router.post("/add", auth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0)
      return res.status(400).json({ message: "Invalid amount" });

    let wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) wallet = await Wallet.create({ user: req.user.id, balance: 0 });

    wallet.balance += amount;
    wallet.transactions.push({
      type: "credit",
      amount,
      description: "Wallet top-up",
    });

    await wallet.save();
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
