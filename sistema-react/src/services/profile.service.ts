import { api } from './api'
import type { Activity, Session, Contribution } from '@/types/index.ts'

type ProfileResponse = {
  data: {
    id: string
    email: string
    name: string
    bio?: string
    avatarUrl: string | null
    role: string | null
    stack: string[] | null
    cpuLevel: number | null
    onboarded: boolean
    theme: string
    tourDone: boolean
    plan: string
    authenticated: boolean
    commits?: number
    deploys?: number
    prsMerged?: number
    aiTokens?: string
    joined?: string
  }
}

type ActivityResponse = {
  data: Array<{
    color: string
    text: string
    time: string
    tag?: string
    tagColor?: string
    tagTextColor?: string
  }>
}

export async function getProfile(): Promise<{ name: string; bio: string; handle: string; initials: string; role: string; plan: string; commits: number; deploys: number; prsMerged: number; aiTokens: string; joined: string; stack: string[] }> {
  const result = await api.get<ProfileResponse>('/profile')
  const data = result.data
  return {
    name: data.name,
    bio: data.bio || '',
    handle: `@${data.name.toLowerCase().replace(/\s/g, '.')}`,
    initials: data.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(),
    role: data.role || 'Frontend',
    plan: data.plan,
    commits: data.commits || 0,
    deploys: data.deploys || 0,
    prsMerged: data.prsMerged || 0,
    aiTokens: data.aiTokens || '0',
    joined: data.joined || 'Jan 2025',
    stack: data.stack || ['React', 'TypeScript', 'Node.js'],
  }
}

export async function updateProfile(data: Partial<{ name: string; bio: string }>): Promise<{ name: string; bio: string; handle: string; initials: string; role: string; plan: string; commits: number; deploys: number; prsMerged: number; aiTokens: string; joined: string; stack: string[] }> {
  await api.patch<ProfileResponse>('/profile', data)
  return getProfile()
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean }> {
  const result = await api.post<{ data: { success: boolean } }>('/profile/password', { oldPassword, newPassword })
  return result.data
}

export async function completeOnboarding(): Promise<{ success: boolean }> {
  const result = await api.post<{ data: { success: boolean } }>('/profile/onboarding', {})
  return result.data
}

export async function completeTour(): Promise<{ success: boolean }> {
  const result = await api.post<{ data: { success: boolean } }>('/profile/tour', {})
  return result.data
}

export async function updateTheme(theme: string): Promise<{ theme: string }> {
  const result = await api.patch<{ data: { theme: string } }>('/profile/theme', { theme })
  return result.data
}

export async function getContributions(period = 90): Promise<Contribution[]> {
  const result = await api.get<{ data: Contribution[] }>('/profile/contributions?period=' + period)
  return result.data
}

export async function getActivities(filter?: string): Promise<Activity[]> {
  const params = new URLSearchParams()
  if (filter && filter !== 'all') params.set('tag', filter)

  const query = params.toString() ? `?${params.toString()}` : ''
  const result = await api.get<ActivityResponse>(`/profile/activities${query}`)
  return result.data
}

export async function getSessions(): Promise<Session[]> {
  const result = await api.get<{ data: Session[] }>('/profile/sessions')
  return result.data
}

export async function deleteAccount(): Promise<{ success: boolean }> {
  const result = await api.delete('/profile')
  return result.data
}
