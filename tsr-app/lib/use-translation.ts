import { useLanguage } from "./language-context"
import { translations } from "./translations"

export function useTranslation() {
  const { language } = useLanguage()

  function t(key: keyof (typeof translations)["en"]) {
    return translations[language][key] || key
  }

  return { t }
}

