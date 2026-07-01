class EmailService {
  constructor() {
    this.transporter = null;
  }

  async getTransporter() {
    if (this.transporter) return this.transporter;
    try {
      const nodemailer = require('nodemailer');
      if (process.env.SMTP_HOST) {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
      } else {
        this.transporter = null;
      }
    } catch {
      this.transporter = null;
    }
    return this.transporter;
  }

  async send({ to, subject, text, html }) {
    const transporter = await this.getTransporter();
    if (transporter) {
      try {
        const info = await transporter.sendMail({
          from: process.env.SMTP_FROM || 'noreply@svnu.edu',
          to,
          subject,
          text,
          html
        });
        return { success: true, messageId: info.messageId };
      } catch (err) {
        console.error('[EmailService] Failed to send email:', err.message);
        return { success: false, error: err.message };
      }
    }
    console.log(`[EmailService] Mock email sent to: ${to}, subject: ${subject}`);
    return { success: true, messageId: `mock-${Date.now()}` };
  }

  async sendOTP(email, otp) {
    return this.send({
      to: email,
      subject: 'رمز التحقق الخاص بك',
      text: `رمز التحقق الخاص بك هو: ${otp}. صالح لمدة 5 دقائق.`,
      html: `<p>رمز التحقق الخاص بك هو: <strong>${otp}</strong></p><p>صالح لمدة 5 دقائق.</p>`
    });
  }

  async sendSwapNotification(email, swapDetails) {
    return this.send({
      to: email,
      subject: 'طلب تبديل موعد',
      text: `تم تقديم طلب تبديل للمحاضرة: ${swapDetails}`,
    });
  }
}

module.exports = EmailService;
