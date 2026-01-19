"use client"

import { useCallback } from "react"
import { translations } from "./translations"
import { LANGUAGES, DEFAULT_LANGUAGE, type LanguageCode } from "./config"

export function useI18n(language: LanguageCode = DEFAULT_LANGUAGE) {
  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const keys = key.split(".")
      let value: any = translations[language] || translations[DEFAULT_LANGUAGE]

      for (const k of keys) {
        value = value?.[k]
      }

      if (!value) {
        value = key
      }

      // Simple parameter replacement
      if (params) {
        Object.entries(params).forEach(([param, val]) => {
          value = value.replace(`{{${param}}}`, val)
        })
      }

      return value as string
    },
    [language],
  )

  return { t, language, languages: LANGUAGES }
}
