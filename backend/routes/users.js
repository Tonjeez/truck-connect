const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put(
  '/profile',
  protect,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
  ],
  validate,
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { name, phone, vehicleDetails, companyName } = req.body;

      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (user.role === 'driver' && vehicleDetails) {
        user.vehicleDetails = { ...user.vehicleDetails?.toObject?.() ?? user.vehicleDetails, ...vehicleDetails };
      }
      if (user.role === 'client' && companyName !== undefined) {
        user.companyName = companyName;
      }

      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        vehicleDetails: user.vehicleDetails,
        companyName: user.companyName,
        averageRating: user.averageRating,
        reviewCount: user.reviewCount,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
