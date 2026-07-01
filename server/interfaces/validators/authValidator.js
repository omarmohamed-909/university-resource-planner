const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  // التسجيل العام مقيّد بـ student فقط — admin/doctor يُضافون من لوحة الإدارة
  role: z.enum(['student']).default('student').optional(),
  department: z.string().optional(),
  phone: z.string().optional()
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6)
});

const generateOtpSchema = z.object({
  email: z.string().email('يرجى إدخال بريد إلكتروني صحيح')
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

const googleSchema = z.object({
  // يقبل credential (الاسم الرسمي) أو idToken (للتوافق مع النسخ القديمة)
  credential: z.string().min(1).optional(),
  idToken: z.string().min(1).optional(),
}).refine(
  (data) => data.credential || data.idToken,
  { message: 'Google credential or idToken is required' }
);

module.exports = { loginSchema, registerSchema, verifyOtpSchema, generateOtpSchema, refreshSchema, googleSchema };
