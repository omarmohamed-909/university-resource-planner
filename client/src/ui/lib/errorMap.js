import i18n from './i18n'

const arabicToKey = {
  'البريد الإلكتروني مستخدم بالفعل': 'error.emailExists',
  'رقم الهاتف مستخدم بالفعل': 'error.phoneExists',
  'بريد إلكتروني أو كلمة مرور غير صحيحة': 'error.invalidCredentials',
  'كلمة المرور غير صحيحة': 'error.wrongPassword',
  'المستخدم غير موجود': 'error.userNotFound',
  'انتهت الجلسة': 'error.sessionExpired',
  'ليس لديك صلاحية': 'error.forbidden',
  'القاعة غير متاحة': 'error.hallNotAvailable',
  'الوقت غير متاح': 'error.timeSlotNotAvailable',
  'المدرج أو الوقت محجوز بالفعل': 'error.scheduleConflict',
  'تعارض في الجدول': 'error.scheduleConflict',
  'المادة غير موجودة': 'error.courseNotFound',
  'القاعة غير موجودة': 'error.hallNotFound',
  'الجدول غير موجود': 'error.scheduleNotFound',
  'لم يعد الطلب موجوداً': 'error.notFound',
  'لا يمكن حذف قاعة بها جداول': 'error.hallHasSchedules',
  'لا يمكن حذف مادة بها جداول': 'error.courseHasSchedules',
  'طلب التبادل غير موجود': 'error.swapNotFound',
  'طلب التبادل منتهي': 'error.swapExpired',
  'تمت معالجة طلب التبادل مسبقاً': 'error.swapAlreadyProcessed',
  'رمز QR غير صالح': 'error.invalidQrCode',
  'رمز QR منتهي الصلاحية': 'error.expiredQrCode',
  'تم تسجيل الحضور مسبقاً': 'error.alreadyCheckedIn',
  'المحاضرة غير موجودة': 'error.lectureNotFound',
  'الحضور غير متاح حالياً': 'error.attendanceNotAvailable',
  'البيانات غير صالحة': 'error.invalidData',
  'القيمة موجودة بالفعل': 'error.duplicateEntry',
  'حدث خطأ غير متوقع': 'error.unexpected',
}

export function translateServerError(message) {
  if (!message || typeof message !== 'string') return message
  const key = arabicToKey[message.trim()]
  if (key) return i18n.t(key)
  return message
}
