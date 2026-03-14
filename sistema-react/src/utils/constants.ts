import type { Role, RoleTheme } from '@/types'

export const ROLE_THEMES: Record<Role, RoleTheme> = {
  Frontend: { hex: '#3b82f6', name: 'UI Edge' },
  Backend: { hex: '#22c55e', name: 'Core API' },
  Design: { hex: '#c026d3', name: 'Creative' },
  Data: { hex: '#eab308', name: 'Pipelines' }
}

export const STORAGE_KEYS = {
  ROLE: 'nexus_role',
  STACK: 'nexus_stack',
  CPU: 'nexus_cpu',
  ONBOARDED: 'nexus_onboarded',
  THEME: 'nexus_theme',
  TOUR_DONE: 'nexus_tour_done',
  USER_NAME: 'nexus_user_name',
  AUTH: 'nexus_auth',
  LANG: 'nexus_lang',
  CUSTOM_PROJECTS: 'nexus_custom_projects'
} as const
