const express = require("express");
const auth = require("../middleware/auth.middleware");
const Wallet = require("../models/wallet.model");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  const wallet = await Wallet.findOne({ user: req.user.id });
  res.json(wallet || { balance: 0, transactions: [] });
});

router.post("/add", auth, async (req, res) => {
  const { amount } = req.body;
  let wallet = await Wallet.findOne({ user: req.user.id });
  if (!wallet) wallet = await Wallet.create({ user: req.user.id, balance: 0 });
  wallet.balance += amount;
  wallet.transactions.push({ type: "credit", amount, description: "Wallet top-up" });
  await wallet.save();
  res.json(wallet);
});

module.exports = router;
