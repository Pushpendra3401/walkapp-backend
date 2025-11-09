const express = require("express");
const Review = require("../models/review.model");
const auth = require("../middleware/auth.middleware");

const router = express.Router();

// Create review
router.post("/", auth, async (req, res) => {
  try {
    const { booking, reviewee, rating, comment } = req.body;
    const review = await Review.create({
      booking,
      reviewer: req.user.id,
      reviewee,
      rating,
      comment,
    });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all reviews for a user
router.get("/:userId", async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId }).populate(
      "reviewer",
      "name"
    );
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
