const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pickupLocation: { type: String, required: true, trim: true },
    dropoffLocation: { type: String, required: true, trim: true },
    cargoWeight: { type: String, required: true, trim: true },
    cargoDescription: { type: String, required: true, trim: true },
    budget: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ['open', 'assigned', 'completed', 'cancelled'],
      default: 'open',
    },
    assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
