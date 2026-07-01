const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  hallId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
  day: { type: String, enum: ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'], required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  weekPattern: { type: String, enum: ['weekly', 'odd', 'even'], default: 'weekly' },
  semester: { type: String, required: true }
}, { timestamps: true });

scheduleSchema.index({ hallId: 1, day: 1, weekPattern: 1 });
scheduleSchema.index({ courseId: 1 });
scheduleSchema.index({ semester: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);
