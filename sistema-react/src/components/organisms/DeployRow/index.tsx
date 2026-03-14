import clsx from 'clsx'
import styles from './DeployRow.module.css'

interface DeployData {
  num: number
  env: string
  branch: string
  status: string
  time: string
  duration: string
  deployer: string
}

interface DeployRowProps {
  deploy: DeployData
  onClick?: () => void
  className?: string
}

const envClass: Record<string, string> = {
  prod: 'prod',
  production: 'prod',
  staging: 'staging',
  preview: 'preview',
}

const statusClass: Record<string, string> = {
  success: 'success',
  fail: 'fail',
  building: 'building',
}

export function DeployRow({ deploy, onClick, className }: DeployRowProps) {
  const envKey = envClass[deploy.env.toLowerCase()] ?? 'staging'
  const statusKey = statusClass[deploy.status.toLowerCase()] ?? 'success'

  return (
    <div
      className={clsx(styles.row, className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick() } : undefined}
    >
      <div className={styles.statusCol}>
        <span className={clsx(styles.dot, styles[statusKey])} />
        <span className={styles.hash}>#{deploy.num}</span>
      </div>
      <div className={styles.branchCol}>
        <strong>{deploy.branch}</strong>
        <span className={styles.deployer}>{deploy.deployer}</span>
      </div>
      <div>
        <span className={clsx(styles.env, styles[envKey])}>{deploy.env}</span>
      </div>
      <div className={styles.time}>{deploy.time}</div>
      <div className={styles.duration}>{deploy.duration}</div>
    </div>
  )
}
