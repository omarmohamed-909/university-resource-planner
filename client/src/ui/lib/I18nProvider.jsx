import { useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'

function syncHtmlAttrs(lng) {
  const dir = i18n.dir(lng)
  document.documentElement.lang = lng
  document.documentElement.dir = dir
  document.title = i18n.t('common.documentTitle')
}

export default function I18nProvider({ children }) {
  useEffect(() => {
    syncHtmlAttrs(i18n.language)
    i18n.on('languageChanged', syncHtmlAttrs)
    return () => {
      i18n.off('languageChanged', syncHtmlAttrs)
    }
  }, [])

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  )
}
