export type Role = 'Frontend' | 'Backend' | 'Design' | 'Data'

export interface RoleTheme {
  hex: string
  name: string
}

export interface User {
  authenticated: boolean
  userName: string
  role: Role
  stack: string[]
  cpuLevel: number
  onboarded: boolean
  theme: 'dark' | 'light'
  tourDone: boolean
}
