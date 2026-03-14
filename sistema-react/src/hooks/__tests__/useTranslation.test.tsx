import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { I18nProvider } from '@/stores/I18nContext.tsx'
import { useTranslation } from '../useTranslation'

function wrapper({ children }: { children: ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>
}

describe('useTranslation', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('throws error when used outside provider', () => {
    expect(() => {
      renderHook(() => useTranslation())
    }).toThrow('useTranslation must be used inside I18nProvider')
  })

  it('t() returns translated string', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper })
    const translated = result.current.t('common.save')
    expect(typeof translated).toBe('string')
    expect(translated.length).toBeGreaterThan(0)
    expect(translated).not.toBe('common.save')
  })

  it('t() with interpolation works', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper })
    const translated = result.current.t('panorama.welcome', { greeting: 'Hello', name: 'Alex' })
    expect(translated).toContain('Hello')
    expect(translated).toContain('Alex')
  })

  it('setLang changes language', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper })

    act(() => {
      result.current.setLang('en')
    })

    expect(result.current.lang).toBe('en')
    expect(result.current.t('common.save')).toBe('Save')

    act(() => {
      result.current.setLang('pt-BR')
    })

    expect(result.current.lang).toBe('pt-BR')
    expect(result.current.t('common.save')).toBe('Salvar')
  })
})
