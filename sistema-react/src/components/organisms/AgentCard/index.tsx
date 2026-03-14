import clsx from 'clsx'
import { Sparkline } from '@/components/organisms/Sparkline'
import styles from './AgentCard.module.css'

interface AgentData {
  name: string
  emoji: string
  color: string
  type: string
  model: string
  status: string
  desc: string
  tasks: number
  tokens: string
  uptime: string
}

interface AgentCardProps {
  agent: AgentData
  sparklineData?: number[]
  onClick?: () => void
  className?: string
}

export function AgentCard({ agent, sparklineData, onClick, className }: AgentCardProps) {
  const isRunning = agent.status === 'running'

  return (
    <div
      className={clsx(styles.card, className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick() } : undefined}
    >
      <div className={styles.top}>
        <div className={styles.identity}>
          <span className={styles.emoji}>{agent.emoji}</span>
          <div>
            <div className={styles.name}>{agent.name}</div>
            <div className={styles.model}>{agent.model}</div>
          </div>
        </div>
        <span className={clsx(styles.statusBadge, isRunning ? styles.running : styles.idle)}>
          {isRunning && <span className={styles.pulse} />}
          {agent.status}
        </span>
      </div>
      <div className={styles.desc}>{agent.desc}</div>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Tasks</span>
          <span className={styles.statValue}>{agent.tasks}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Tokens</span>
          <span className={styles.statValue}>{agent.tokens}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Uptime</span>
          <span className={styles.statValue}>{agent.uptime}</span>
        </div>
      </div>
      {sparklineData && <Sparkline data={sparklineData} color={agent.color} />}
    </div>
  )
}
