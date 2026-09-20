const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['job_posted', 'bid_received', 'bid_accepted', 'job_completed', 'review_received'],
      required: true,
    },
    message: { type: String, required: true },
    relatedJob: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
