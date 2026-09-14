const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be configured in production');
  }
  return 'dev-only-fallback-secret';
}

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
  }

  async init(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.io.use((socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      try {
        const secret = getJwtSecret();
        const decoded = jwt.verify(token, secret);
        socket.user = decoded;
        next();
      } catch {
        next(new Error('Invalid or expired token'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join:hall', (hallId) => {
        socket.join(`hall:${hallId}`);
      });

      socket.on('leave:hall', (hallId) => {
        socket.leave(`hall:${hallId}`);
      });

      socket.on('join:user', (userId) => {
        // التحقق أن المستخدم يحاول الانضمام لـ room خاصة به فقط
        const tokenUserId = socket.user?.id || socket.user?._id || socket.user?.userId
        if (String(userId) !== String(tokenUserId)) {
          console.warn(`[socket] Unauthorized room join attempt: claimed=${userId}, actual=${tokenUserId}`)
          return
        }
        socket.join(`user:${userId}`)
        this.connectedUsers.set(userId, socket.id)
      });

      socket.on('disconnect', () => {
        for (const [userId, sid] of this.connectedUsers) {
          if (sid === socket.id) {
            this.connectedUsers.delete(userId);
            break;
          }
        }
        console.log('Client disconnected:', socket.id);
      });
    });

    if (process.env.REDIS_URL) {
      const { createAdapter } = require('@socket.io/redis-adapter');
      const { createClient } = require('redis');
      const pubClient = createClient({ url: process.env.REDIS_URL });
      const subClient = pubClient.duplicate();
      pubClient.on('error', error => console.error('[socket-redis:pub]', error));
      subClient.on('error', error => console.error('[socket-redis:sub]', error));
      await Promise.all([pubClient.connect(), subClient.connect()]);
      this.io.adapter(createAdapter(pubClient, subClient));
      this.redisClients = [pubClient, subClient];
      console.log('[socket] Redis adapter ready');
    }
  }

  emitHallStatusUpdate(hallId, status) {
    if (this.io) {
      this.io.to(`hall:${hallId}`).emit('hall:status', { hallId, status });
    }
  }

  emitScheduleChange(schedule) {
    if (this.io) {
      this.io.emit('schedule:updated', schedule);
      this.io.to(`hall:${schedule.hallId}`).emit('hall:schedule', schedule);
    }
  }

  notifyUser(userId, event, data) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, data);
    }
  }

  broadcast(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }
}

module.exports = SocketService;
