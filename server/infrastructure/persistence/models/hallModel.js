const mongoose = require('mongoose');

const hallSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['lecture', 'lab'], required: true },
  capacity: { type: Number, required: true, min: 1 },
  floor: { type: Number },
  building: { type: String, trim: true },
  equipment: [{
    name: { type: String },
    condition: { type: String, enum: ['working', 'needs_maintenance', 'broken'], default: 'working' }
  }],
  status: { type: String, enum: ['active', 'maintenance', 'inactive'], default: 'active' }
}, { timestamps: true });

hallSchema.index({ type: 1, status: 1 });
hallSchema.index({ building: 1, floor: 1 });

module.exports = mongoose.model('Hall', hallSchema);
