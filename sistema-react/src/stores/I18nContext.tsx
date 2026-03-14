import { createContext, useState, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import ptBR from '@/i18n/pt-BR.json'
import en from '@/i18n/en.json'
import es from '@/i18n/es.json'
import { STORAGE_KEYS } from '@/utils/constants.ts'

type Lang = 'pt-BR' | 'en' | 'es'
type Dictionary = Record<string, string>

const dictionaries: Record<Lang, Dictionary> = {
  'pt-BR': ptBR,
  'en': en,
  'es': es,
}

interface I18nContextValue {
  t: (key: string, params?: Record<string, string | number>) => string
  lang: Lang
  setLang: (lang: Lang) => void
}

export const I18nContext = createContext<I18nContextValue | null>(null)

function detectLang(): Lang {
  if (typeof window === 'undefined') return 'pt-BR'

  const stored = window.localStorage.getItem(STORAGE_KEYS.LANG) as Lang | null
  if (stored && dictionaries[stored]) return stored

  const nav = navigator.language
  if (nav.startsWith('pt')) return 'pt-BR'
  if (nav.startsWith('es')) return 'es'
  if (nav.startsWith('en')) return 'en'

  return 'pt-BR'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang)

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEYS.LANG, newLang)
    }
  }, [])

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let text = dictionaries[lang]?.[key]
      ?? dictionaries['pt-BR']?.[key]
      ?? dictionaries['en']?.[key]
      ?? key

    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
      }
    }

    return text
  }, [lang])

  const value = useMemo(() => ({ t, lang, setLang }), [t, lang, setLang])

  return (
    <I18nContext value={value}>
      {children}
    </I18nContext>
  )
}
