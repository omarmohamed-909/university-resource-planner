'use strict';

/**
 * validateEnv — يتحقق من وجود متغيرات البيئة الأساسية عند بدء التشغيل.
 * في production يُوقف التطبيق إذا غابت أي متغير حرج.
 * في development يعرض تحذير فقط.
 */
function validateEnv() {
  const isProd = process.env.NODE_ENV === 'production';

  const required = [
    { key: 'MONGODB_URI',   critical: true  },
    { key: 'JWT_SECRET',    critical: true  },
    { key: 'QR_SECRET',     critical: isProd },
    { key: 'CLIENT_URL',    critical: isProd },
    { key: 'REDIS_URL',     critical: isProd },
    { key: 'SMTP_HOST',     critical: isProd },  // إلزامي في production لإرسال OTP والإشعارات
  ];

  const missing = required.filter(({ key }) => !process.env[key]);

  if (missing.length === 0) return;

  const criticalMissing = missing.filter(({ critical }) => critical);
  const warnMissing     = missing.filter(({ critical }) => !critical);

  if (warnMissing.length > 0) {
    console.warn(
      `[config] ⚠️  متغيرات بيئة غير محددة (تحذير): ${warnMissing.map(m => m.key).join(', ')}`
    );
  }

  if (criticalMissing.length > 0) {
    const msg = `[config] ❌ متغيرات بيئة حرجة مفقودة: ${criticalMissing.map(m => m.key).join(', ')}`;
    console.error(msg);
    if (isProd) {
      process.exit(1);
    } else {
      console.warn('[config] ⚠️  التشغيل في وضع degraded — هذا الخطأ سيوقف التطبيق في production!');
    }
  }
}

module.exports = { validateEnv };
