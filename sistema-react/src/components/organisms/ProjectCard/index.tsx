import clsx from 'clsx'
import styles from './ProjectCard.module.css'

interface ProjectData {
  name: string
  desc: string
  icon: string
  status: string
  commits: number
  branch: string
  emoji?: string
}

interface ProjectCardProps {
  project: ProjectData
  onClick?: () => void
  className?: string
}

export function ProjectCard({ project, onClick, className }: ProjectCardProps) {
  const statusClass = project.status === 'active' ? styles.active : styles.draft

  return (
    <div
      className={clsx(styles.card, className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick() } : undefined}
    >
      <div className={styles.top}>
        <div className={styles.icon} style={{ background: project.icon }}>
          {project.emoji ?? ''}
        </div>
        <span className={clsx(styles.statusBadge, statusClass)}>
          {project.status}
        </span>
      </div>
      <div className={styles.name}>{project.name}</div>
      <div className={styles.desc}>{project.desc}</div>
      <div className={styles.meta}>
        <span>{project.commits} commits</span>
        <span>{project.branch}</span>
      </div>
    </div>
  )
}
