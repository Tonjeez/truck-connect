const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, min: 0 },
    message: { type: String, trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

bidSchema.index({ job: 1, driver: 1 }, { unique: true });

module.exports = mongoose.model('Bid', bidSchema);
