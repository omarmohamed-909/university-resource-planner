const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

async function connectDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/svnu';
  const maxRetries = parseInt(process.env.MONGODB_CONNECT_RETRIES || '5', 10);
  const retryDelayMs = parseInt(process.env.MONGODB_CONNECT_RETRY_DELAY_MS || '3000', 10);

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await mongoose.connect(uri);
      console.log('MongoDB connected successfully');
      break;
    } catch (error) {
      const finalAttempt = attempt === maxRetries;
      console.error(`MongoDB connection attempt ${attempt}/${maxRetries} failed:`, error.message);
      if (finalAttempt) {
        throw error;
      }
      await delay(retryDelayMs);
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB runtime error:', err);
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { connectDatabase };
