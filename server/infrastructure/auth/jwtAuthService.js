const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class JwtAuthService {
  constructor() {
    this.secret = this.getSecret();
    this.expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  getSecret() {
    if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be configured in production');
    }
    return 'dev-only-fallback-secret';
  }

  async hashPassword(password) {
    return bcrypt.hash(password, 12);
  }

  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  generateToken(user) {
    return jwt.sign(
      { id: user.id || user._id, role: user.role, email: user.email },
      this.secret,
      { expiresIn: this.expiresIn }
    );
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch {
      return null;
    }
  }

  verifyRefreshToken(token) {
    const decoded = this.verifyToken(token);
    if (!decoded || decoded.type !== 'refresh') return null;
    return decoded;
  }

  generateRefreshToken(user) {
    return jwt.sign(
      { id: user.id || user._id, type: 'refresh' },
      this.secret,
      { expiresIn: '30d' }
    );
  }
}

module.exports = JwtAuthService;
