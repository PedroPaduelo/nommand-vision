import clsx from 'clsx'
import styles from './TabNavigation.module.css'

interface Tab {
  key: string
  label: string
}

interface TabNavigationProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (key: string) => void
  className?: string
}

export function TabNavigation({ tabs, activeTab, onTabChange, className }: TabNavigationProps) {
  return (
    <div className={clsx(styles.dashTabs, className)}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          className={clsx(styles.dtab, activeTab === tab.key && styles.dtabActive)}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
