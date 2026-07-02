import i18n from './i18n'

export function formatTime(date) {
  return new Date(date).toLocaleTimeString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getWeekday(date) {
  return new Date(date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'long',
  })
}
