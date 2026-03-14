import { useState, useCallback } from 'react'
import type { Role } from '@/types/index.ts'

interface OnboardingState {
  role: Role
  stack: string[]
  cpuLevel: number
}

export function useOnboarding() {
  const [view, setView] = useState(0)
  const [state, setState] = useState<OnboardingState>({
    role: 'Frontend',
    stack: [],
    cpuLevel: 2,
  })

  const goTo = useCallback((step: number) => {
    setView(Math.max(0, Math.min(3, step)))
  }, [])

  const updateState = useCallback((partial: Partial<OnboardingState>) => {
    setState(prev => ({ ...prev, ...partial }))
  }, [])

  const finish = useCallback(() => {
    return state
  }, [state])

  return {
    view,
    goTo,
    state,
    updateState,
    finish,
  }
}
