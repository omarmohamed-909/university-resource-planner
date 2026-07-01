const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalScheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
  proposedHallId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall' },
  proposedDay: { type: String, enum: ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'] },
  proposedStartTime: { type: String },
  proposedEndTime: { type: String },
  reason: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

swapRequestSchema.index({ requesterId: 1, status: 1 });
swapRequestSchema.index({ originalScheduleId: 1 });

module.exports = mongoose.model('SwapRequest', swapRequestSchema);
