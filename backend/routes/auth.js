const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/auth');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('role').isIn(['driver', 'client']).withMessage('Role must be driver or client'),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, email, password, phone, role, vehicleDetails, companyName } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const user = await User.create({
        name,
        email,
        password,
        phone,
        role,
        vehicleDetails: role === 'driver' ? vehicleDetails : undefined,
        companyName: role === 'client' ? companyName : undefined,
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        vehicleDetails: user.vehicleDetails,
        companyName: user.companyName,
        token: generateToken(user._id),
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        vehicleDetails: user.vehicleDetails,
        companyName: user.companyName,
        averageRating: user.averageRating,
        token: generateToken(user._id),
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
