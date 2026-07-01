const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  password: { type: String, required: false },
  role: { type: String, enum: ['admin', 'doctor', 'student'], required: true },
  department: { type: String, trim: true },
  phone: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  googleId: { type: String, sparse: true, unique: true },
  picture: { type: String },
}, { timestamps: true });

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });

module.exports = mongoose.model('User', userSchema);
