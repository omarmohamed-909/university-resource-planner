const QRCode = require('qrcode');
const crypto = require('crypto');

class QrCodeService {
  getSecret() {
    return process.env.QR_SECRET || process.env.JWT_SECRET || 'dev-only-fallback-secret';
  }

  signPayload(payload) {
    return crypto
      .createHmac('sha256', this.getSecret())
      .update(JSON.stringify(payload))
      .digest('hex');
  }

  async generate(data) {
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    return QRCode.toDataURL(payload);
  }

  async generateForSession(scheduleId, date) {
    const payload = { scheduleId, date: date.toISOString(), type: 'attendance' };
    return this.generate(payload);
  }

  async generateAttendanceSession(scheduleId, ttlMinutes = 10) {
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + ttlMinutes * 60 * 1000);
    const payload = {
      type: 'attendance',
      scheduleId,
      nonce: crypto.randomUUID(),
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString()
    };
    const signedPayload = {
      ...payload,
      signature: this.signPayload(payload)
    };

    return {
      qrCode: await this.generate(signedPayload),
      payload: JSON.stringify(signedPayload),
      scheduleId,
      expiresAt: expiresAt.toISOString()
    };
  }

  verifyAttendancePayload(qrData, scheduleId) {
    if (!qrData) throw new Error('QR data is required');

    let payload;
    try {
      payload = JSON.parse(qrData);
    } catch {
      throw new Error('Invalid QR data');
    }

    const { signature, ...unsignedPayload } = payload;
    if (payload.type !== 'attendance' || payload.scheduleId !== scheduleId) {
      throw new Error('QR code does not match this lecture');
    }
    if (!payload.nonce || !payload.expiresAt || !signature || typeof signature !== 'string') {
      throw new Error('QR code is missing security data');
    }

    const expected = this.signPayload(unsignedPayload);
    if (signature.length !== expected.length) {
      throw new Error('QR code signature is invalid');
    }
    const validSignature = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
    if (!validSignature) throw new Error('QR code signature is invalid');

    const expiresAt = new Date(payload.expiresAt);
    if (Number.isNaN(expiresAt.getTime())) throw new Error('Invalid QR expiry');
    if (expiresAt.getTime() < Date.now()) {
      throw new Error('QR code has expired');
    }

    return payload;
  }

  parseQRCode(qrData) {
    try {
      return JSON.parse(qrData);
    } catch {
      return { raw: qrData };
    }
  }
}

module.exports = QrCodeService;
