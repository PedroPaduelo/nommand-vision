import { useEffect, useRef } from 'react'

interface ShortcutCallbacks {
  onOpenCmdk: () => void
  onOpenShortcuts: () => void
}

export function useKeyboardShortcuts(
  navigate: (path: string) => void,
  callbacks: ShortcutCallbacks
) {
  const gPressedRef = useRef(false)
  const gTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const tag = target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      const mod = e.ctrlKey || e.metaKey

      if (mod && e.key === 'k') {
        e.preventDefault()
        callbacks.onOpenCmdk()
        return
      }

      if (mod && e.key === 'n') {
        e.preventDefault()
        navigate('/projetos')
        return
      }

      if (mod && e.key === 'd') {
        e.preventDefault()
        navigate('/deploys')
        return
      }

      if (mod && e.key === 'l') {
        e.preventDefault()
        navigate('/logs')
        return
      }

      if (e.key === '?') {
        e.preventDefault()
        callbacks.onOpenShortcuts()
        return
      }

      if (e.key === 'g' && !gPressedRef.current) {
        gPressedRef.current = true
        if (gTimerRef.current) clearTimeout(gTimerRef.current)
        gTimerRef.current = setTimeout(() => {
          gPressedRef.current = false
        }, 1000)
        return
      }

      if (gPressedRef.current) {
        gPressedRef.current = false
        if (gTimerRef.current) {
          clearTimeout(gTimerRef.current)
          gTimerRef.current = null
        }

        const routes: Record<string, string> = {
          p: '/panorama',
          j: '/projetos',
          i: '/inbox',
          a: '/analytics',
          d: '/deploys',
          s: '/configuracoes',
          m: '/marketplace',
          l: '/logs',
        }

        const route = routes[e.key]
        if (route) {
          e.preventDefault()
          navigate(route)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (gTimerRef.current) clearTimeout(gTimerRef.current)
    }
  }, [navigate, callbacks])
}
