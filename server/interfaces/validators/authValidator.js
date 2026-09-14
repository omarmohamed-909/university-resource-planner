const { z } = require('zod');

// سياسة كلمة المرور الموحّدة: 8 أحرف على الأقل + حرف كبير + رقم
const passwordPolicy = () =>
  z.string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .regex(/[A-Z]/, 'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل')
    .regex(/[0-9]/, 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل');

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: passwordPolicy(),
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
