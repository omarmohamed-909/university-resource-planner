const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent'], default: 'absent' },
  qrCode: { type: String }
}, { timestamps: true });

attendanceSchema.index({ scheduleId: 1, studentId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ scheduleId: 1, date: -1 });
attendanceSchema.index({ studentId: 1, date: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
