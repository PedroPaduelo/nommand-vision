import type { Role } from './auth'

export interface Project {
  id: string
  name: string
  desc: string
  icon: string
  status: 'active' | 'draft'
  commits: number
  branch: string
  framework: string
  deploys: number
  uptime: string
  agents: string[]
  stack: string[]
  lastDeploy: string
  role: Role
}

export interface Deploy {
  num: number
  env: 'prod' | 'staging' | 'preview'
  branch: string
  status: 'success' | 'fail' | 'building'
  time: string
  duration: string
  deployer: string
}

export interface InboxMessage {
  id: number
  from: string
  email: string
  av: string
  initials: string
  online: boolean
  subject: string
  preview: string
  tag: 'deploy' | 'mention' | 'ai' | 'alert' | 'review'
  tagLabel: string
  filters: string[]
  unread: boolean
  time: string
  attachment: boolean
  body: string
}

export interface Agent {
  id: string
  name: string
  emoji: string
  color: string
  type: string
  model: string
  status: 'running' | 'idle' | 'stopped' | 'error'
  desc: string
  tasks: number
  tokens: string
  uptime: string
  lastRun: string
  latency: string
}

export interface Endpoint {
  endpoint: string
  requests: number
  latency: number
  error: number
  p99: number
  status: 'success' | 'warning' | 'error'
}

export interface WorkflowStep {
  icon: string
  label: string
}

export interface Workflow {
  id: string
  name: string
  icon: string
  type: string
  desc: string
  active: boolean
  steps: WorkflowStep[]
  executions: number
  successRate: string
  avgTime: string
  lastRun: string
}

export interface MarketplaceAgent {
  id: string
  name: string
  author: string
  icon: string
  cat: string
  desc: string
  tags: string[]
  category: string
  stars: number
  downloads: string
  verified: boolean
  recommended: Role[]
  installed?: boolean
}

export interface StatusService {
  name: string
  icon: string
  desc: string
  uptime: number
  status: 'operational' | 'degraded' | 'down' | 'maintenance'
}

export interface IncidentUpdate {
  time: string
  text: string
}

export interface Incident {
  id: string
  title: string
  severity: 'critical' | 'major' | 'minor'
  status: 'resolved' | 'investigating' | 'monitoring'
  updates: IncidentUpdate[]
}

export interface LogEntry {
  id: string
  timestamp: string
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'
  source: string
  message: string
  detail?: string
}

export interface Notification {
  id: string
  icon: string
  iconColor: string
  title: string
  desc: string
  unread: boolean
}

export interface Activity {
  color: string
  text: string
  time: string
  tag?: string
  tagColor?: string
  tagTextColor?: string
}

export interface Session {
  device: string
  name: string
  current: boolean
}
