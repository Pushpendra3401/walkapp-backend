const express = require("express");
const Review = require("../models/review.model");
const auth = require("../middleware/auth.middleware");
const router = express.Router();

router.post("/", auth, async (req, res) => {
  const { booking, reviewee, rating, comment } = req.body;
  const review = await Review.create({ booking, reviewer: req.user.id, reviewee, rating, comment });
  res.status(201).json(review);
});

router.get("/:userId", async (req, res) => {
  const reviews = await Review.find({ reviewee: req.params.userId }).populate("reviewer", "name");
  res.json(reviews);
});

module.exports = router;
