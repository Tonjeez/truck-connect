const express = require('express');
const { body, validationResult } = require('express-validator');
const Job = require('../models/Job');
const Bid = require('../models/Bid');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
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
  authorize('client'),
  [
    body('pickupLocation').trim().notEmpty().withMessage('Pickup location is required'),
    body('dropoffLocation').trim().notEmpty().withMessage('Drop-off location is required'),
    body('cargoWeight').trim().notEmpty().withMessage('Cargo weight is required'),
    body('cargoDescription').trim().notEmpty().withMessage('Cargo description is required'),
  ],
  validate,
  async (req, res) => {
    try {
      const job = await Job.create({ ...req.body, client: req.user._id });
      const populated = await Job.findById(job._id).populate('client', 'name email phone companyName');

      const drivers = await User.find({ role: 'driver' });
      await Promise.all(
        drivers.map((driver) =>
          createNotification({
            user: driver._id,
            type: 'job_posted',
            message: `New cargo job: ${job.pickupLocation} → ${job.dropoffLocation}`,
            relatedJob: job._id,
          })
        )
      );

      res.status(201).json(populated);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get('/', protect, async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};

    if (req.user.role === 'client') {
      filter.client = req.user._id;
    } else if (req.user.role === 'driver') {
      filter.$or = [{ status: 'open' }, { assignedDriver: req.user._id }];
    }

    if (status) filter.status = status;

    const jobs = await Job.find(filter)
      .populate('client', 'name email phone companyName averageRating')
      .populate('assignedDriver', 'name email phone vehicleDetails averageRating')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('client', 'name email phone companyName averageRating')
      .populate('assignedDriver', 'name email phone vehicleDetails averageRating');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const bids = await Bid.find({ job: job._id })
      .populate('driver', 'name email phone vehicleDetails averageRating reviewCount')
      .sort({ createdAt: -1 });

    res.json({ job, bids });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/cancel', protect, authorize('client'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Only open jobs can be cancelled' });
    }

    job.status = 'cancelled';
    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/complete', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const isClient = job.client.toString() === req.user._id.toString();
    const isDriver = job.assignedDriver?.toString() === req.user._id.toString();

    if (!isClient && !isDriver) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (job.status !== 'assigned') {
      return res.status(400).json({ message: 'Job must be assigned before completion' });
    }

    job.status = 'completed';
    job.completedAt = new Date();
    await job.save();

    const notifyUser = isClient ? job.assignedDriver : job.client;
    const otherParty = isClient ? 'cargo owner' : 'driver';
    if (notifyUser) {
      await createNotification({
        user: notifyUser,
        type: 'job_completed',
        message: `Job from ${job.pickupLocation} to ${job.dropoffLocation} marked complete by ${otherParty}`,
        relatedJob: job._id,
      });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post(
  '/:id/bids',
  protect,
  authorize('driver'),
  [body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be positive')],
  validate,
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
      if (!job) return res.status(404).json({ message: 'Job not found' });
      if (job.status !== 'open') {
        return res.status(400).json({ message: 'This job is no longer accepting bids' });
      }

      const existingBid = await Bid.findOne({ job: job._id, driver: req.user._id });
      if (existingBid) {
        return res.status(400).json({ message: 'You have already bid on this job' });
      }

      const bid = await Bid.create({
        job: job._id,
        driver: req.user._id,
        amount: req.body.amount,
        message: req.body.message,
      });

      const populated = await Bid.findById(bid._id).populate(
        'driver',
        'name email phone vehicleDetails averageRating'
      );

      await createNotification({
        user: job.client,
        type: 'bid_received',
        message: `${req.user.name} submitted a bid on your cargo job`,
        relatedJob: job._id,
      });

      res.status(201).json(populated);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: 'You have already bid on this job' });
      }
      res.status(500).json({ message: error.message });
    }
  }
);

router.put('/:id/bids/:bidId/accept', protect, authorize('client'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Job is no longer open' });
    }

    const bid = await Bid.findById(req.params.bidId);
    if (!bid || bid.job.toString() !== job._id.toString()) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    bid.status = 'accepted';
    await bid.save();

    await Bid.updateMany(
      { job: job._id, _id: { $ne: bid._id } },
      { status: 'rejected' }
    );

    job.status = 'assigned';
    job.assignedDriver = bid.driver;
    await job.save();

    await createNotification({
      user: bid.driver,
      type: 'bid_accepted',
      message: `Your bid was accepted for ${job.pickupLocation} → ${job.dropoffLocation}`,
      relatedJob: job._id,
    });

    const populated = await Job.findById(job._id)
      .populate('client', 'name email phone companyName')
      .populate('assignedDriver', 'name email phone vehicleDetails averageRating');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
