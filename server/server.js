require('dotenv').config();
const { validateEnv } = require('./config/validateEnv');
validateEnv();
const path = require('path');
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { connectDatabase } = require('./config/database');
const { container, registerDependencies } = require('./config/container');

// معالجة الأخطاء غير المتوقعة قبل أي شيء آخر
process.on('uncaughtException', (err) => {
  console.error('[FATAL] uncaughtException:', err.message || err);
  // نغلق الـ server أولاً لتحرير الـ port قبل الخروج
  if (global._httpServer) {
    global._httpServer.close(() => process.exit(1));
    setTimeout(() => process.exit(1), 3000).unref();
  } else {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason) => {
  console.error('[ERROR] unhandledRejection:', reason);
  // لا نخرج هنا — خطأ غير فاتال لكن نسجله
});

const app = express();
const server = http.createServer(app);

let rateLimitRedisClient;
function redisRateLimitStore(prefix) {
  if (!process.env.REDIS_URL) return undefined;
  const { createClient } = require('redis');
  const { RedisStore } = require('rate-limit-redis');
  if (!rateLimitRedisClient) {
    rateLimitRedisClient = createClient({ url: process.env.REDIS_URL });
    rateLimitRedisClient.on('error', error => console.error('[rate-limit-redis]', error));
    rateLimitRedisClient.connect().catch(error => console.error('[rate-limit-redis] connect failed:', error));
  }
  return new RedisStore({
    sendCommand: (...args) => rateLimitRedisClient.sendCommand(args),
    prefix,
  });
}

// دعم الـ Reverse Proxy (nginx / Render / Railway / Heroku)
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}
const jsonBodyLimit = process.env.JSON_BODY_LIMIT || '100kb';
const formBodyLimit = process.env.FORM_BODY_LIMIT || jsonBodyLimit;

const generalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_MAX) || 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
  store: redisRateLimitStore('rl:general:'),
});

const authLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again later' },
  store: redisRateLimitStore('rl:auth:'),
});

// منع الضغط على auto-generate (GA ثقيل) — مسموح بطلب واحد كل دقيقتين
const autoGenerateLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // دقيقتان
  limit: 3,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'يُسمح بطلب واحد كل دقيقتين للجدولة التلقائية' },
  store: redisRateLimitStore('rl:schedule:'),
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  // Google OAuth popup يحتاج window.postMessage — COOP strict يمنعه
  crossOriginOpenerPolicy: false,
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(generalLimiter);
app.use(express.json({ limit: jsonBodyLimit }));
app.use(express.urlencoded({ extended: true, limit: formBodyLimit }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

registerDependencies();

const errorHandler = container.resolve('errorHandlerMiddleware');

const authRoutes = require('./interfaces/routes/authRoutes');
const scheduleRoutes = require('./interfaces/routes/scheduleRoutes');
const hallRoutes = require('./interfaces/routes/hallRoutes');
const swapRoutes = require('./interfaces/routes/swapRoutes');
const attendanceRoutes = require('./interfaces/routes/attendanceRoutes');
const userRoutes = require('./interfaces/routes/userRoutes');
const courseRoutes = require('./interfaces/routes/courseRoutes');
const healthRoutes = require('./interfaces/routes/healthRoutes');
const systemStatsRoutes = require('./interfaces/routes/systemStatsRoutes');

app.use('/api/health', healthRoutes());
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/otp', authLimiter);
app.use('/api/auth/google', authLimiter);
app.use('/api/auth', authRoutes(container));
app.use('/api/schedules/auto-generate', autoGenerateLimiter);
app.use('/api/schedules', scheduleRoutes(container));
app.use('/api/halls', hallRoutes(container));
app.use('/api/swaps', swapRoutes(container));
app.use('/api/attendance', attendanceRoutes(container));
app.use('/api/users', userRoutes(container));
app.use('/api/courses', courseRoutes(container));
app.use('/api/stats', systemStatsRoutes(container));

const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDatabase();
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      console.error('MongoDB connection failed:', error.message);
      process.exit(1);
    }
    console.error('MongoDB connection failed — server will run in degraded mode:', error.message);
  }
  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.error(`[WARN] Port ${PORT} is in use. Exiting to allow nodemon retry...`);
      process.exit(1);
    } else {
      console.error('[ERROR] Server error:', e);
    }
  });

  server.listen(PORT, () => {
    global._httpServer = server; // عشان uncaughtException يقدر يغلقه ويحرر الـ port
    console.log(`Server running on port ${PORT}`);
    const socketService = container.resolve('socketService');
    if (socketService && socketService.init) {
      Promise.resolve(socketService.init(server)).catch(error => console.error('[socket] init failed:', error));
    }
    const scheduleJobService = container.resolve('scheduleJobService');
    if (scheduleJobService.enabled) {
      scheduleJobService.init().catch(error => console.error('[queue] init failed:', error));
    }
  });
}

start();
