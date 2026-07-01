const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: String, trim: true },
  studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  creditHours: { type: Number, required: true, min: 1 }
}, { timestamps: true });

courseSchema.index({ code: 1 }, { unique: true });
courseSchema.index({ doctorId: 1 });
courseSchema.index({ department: 1 });

module.exports = mongoose.model('Course', courseSchema);
