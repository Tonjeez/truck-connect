const express = require('express');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Job = require('../models/Job');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const createNotification = require('../utils/createNotification');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

router.post(
  '/',
  protect,
  [
    body('jobId').notEmpty().withMessage('Job ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  ],
  validate,
  async (req, res) => {
    try {
      const { jobId, rating, comment } = req.body;
      const job = await Job.findById(jobId);

      if (!job) return res.status(404).json({ message: 'Job not found' });
      if (job.status !== 'completed') {
        return res.status(400).json({ message: 'You can only review completed jobs' });
      }

      const isClient = job.client.toString() === req.user._id.toString();
      const isDriver = job.assignedDriver?.toString() === req.user._id.toString();

      if (!isClient && !isDriver) {
        return res.status(403).json({ message: 'Not authorized to review this job' });
      }

      const reviewee = isClient ? job.assignedDriver : job.client;
      if (!reviewee) {
        return res.status(400).json({ message: 'No user to review for this job' });
      }

      const review = await Review.create({
        job: jobId,
        reviewer: req.user._id,
        reviewee,
        rating,
        comment,
      });

      const reviews = await Review.find({ reviewee });
      const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      await User.findByIdAndUpdate(reviewee, {
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: reviews.length,
      });

      await createNotification({
        user: reviewee,
        type: 'review_received',
        message: `${req.user.name} left you a ${rating}-star review`,
        relatedJob: job._id,
      });

      const populated = await Review.findById(review._id)
        .populate('reviewer', 'name role')
        .populate('reviewee', 'name role');

      res.status(201).json(populated);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: 'You have already reviewed this job' });
      }
      res.status(500).json({ message: error.message });
    }
  }
);

router.get('/user/:userId', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name role')
      .populate('job', 'pickupLocation dropoffLocation')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
