require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const users = [
  { name: 'مدير النظام', email: 'admin@svnu.edu', password: 'admin123', role: 'admin', department: 'الإدارة' },
  { name: 'د. أحمد محمد', email: 'ahmed@svnu.edu', password: 'doctor123', role: 'doctor', department: 'علوم الحاسب' },
  { name: 'طالب تجربة', email: 'student@svnu.edu', password: 'student123', role: 'student', department: 'علوم الحاسب' },
];

async function seed() {
  // ⚠️ سكربت تطوير فقط — لا تشغّل في production
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Seed script must NOT run in production. Exiting.');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/svnu';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const UserModel = require('./infrastructure/persistence/models/userModel');

  for (const u of users) {
    const exists = await UserModel.findOne({ email: u.email });
    if (exists) {
      console.log(`Skipped (already exists): ${u.email}`);
      continue;
    }
    u.password = await bcrypt.hash(u.password, 12);
    await UserModel.create(u);
    console.log(`Created: ${u.email} (${u.role})`);
  }

  await mongoose.disconnect();
  console.log('\nSeed complete. You can now use the quick-login buttons.');
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
