class OtpService {
  constructor() {
    this.OtpModel = null;
  }

  async getModel() {
    if (!this.OtpModel) {
      this.OtpModel = require('../persistence/models/otpModel');
    }
    return this.OtpModel;
  }

  async generate(identifier) {
    const OtpModel = await this.getModel();
    const { randomInt } = require('crypto');
    const otp = randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await OtpModel.findOneAndUpdate(
      { identifier },
      { otp, expiresAt, attempts: 0 },
      { upsert: true }
    );
    return otp;
  }

  async verify(identifier, otp) {
    const OtpModel = await this.getModel();
    const record = await OtpModel.findOne({ identifier });
    if (!record) return false;
    if (Date.now() > new Date(record.expiresAt).getTime()) {
      await OtpModel.deleteOne({ identifier });
      return false;
    }
    if (record.attempts >= 3) {
      await OtpModel.deleteOne({ identifier });
      return false;
    }
    record.attempts++;
    await record.save();
    if (record.otp === otp) {
      await OtpModel.deleteOne({ identifier });
      return true;
    }
    return false;
  }
}

module.exports = OtpService;
