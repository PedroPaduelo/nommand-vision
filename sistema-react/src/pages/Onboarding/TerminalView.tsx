import { useState, useEffect, useRef } from 'react'
import clsx from 'clsx'
import type { Role } from '@/types/index.ts'
import css from './Onboarding.module.css'

interface TerminalViewProps {
  role: Role
  stack: string[]
  cpuLevel: number
  onComplete: () => void
}

interface TermLine {
  text: string
  cls: '' | 'warn' | 'success'
  ts: string
}

function timestamp(): string {
  return new Date().toISOString().substring(11, 23)
}

export default function TerminalView({ role, stack, cpuLevel, onComplete }: TerminalViewProps) {
  const [lines, setLines] = useState<TermLine[]>([])
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'building' | 'ready'>('building')
  const termRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const jobs = [
      { t: `NOMMAND_INIT: workspace=${role.toLowerCase()}_env`, c: '' as const, ms: 200 },
      { t: `ALLOCATING: vCPUs=${cpuLevel * 2}, Mem=${cpuLevel * 4}GB, SSD=50GB`, c: '' as const, ms: 500 },
      { t: `FETCH_DEPS: [${stack.join(', ')}]`, c: '' as const, ms: 900 },
      { t: `RESOLVING: dependency tree (${stack.length * 12 + 47} packages)`, c: '' as const, ms: 1300 },
      { t: `WARN: minor version mismatch in 2 packages — resolving`, c: 'warn' as const, ms: 1600 },
      { t: `BUILD_CONTAINER: ${role.toUpperCase()}_ENV`, c: '' as const, ms: 2000 },
      { t: `INJECTING: AI agents (nommand-v3-turbo)`, c: '' as const, ms: 2300 },
      { t: `CONFIGURING: CI/CD pipeline`, c: '' as const, ms: 2600 },
      { t: `LINK: secure tunnel established (TLS 1.3)`, c: '' as const, ms: 2900 },
      { t: `HEALTHCHECK: all endpoints responding (${Math.floor(Math.random() * 5) + 8}ms avg)`, c: '' as const, ms: 3200 },
      { t: `STATUS: all systems nominal`, c: 'success' as const, ms: 3500 },
    ]
    const totalJobs = jobs.length
    let done = 0
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []

    setLines([])
    setProgress(0)
    setStatus('building')

    jobs.forEach(job => {
      const timer = setTimeout(() => {
        if (cancelled) return
        const line: TermLine = {
          text: job.t,
          cls: job.c,
          ts: timestamp(),
        }
        done++
        setLines(prev => [...prev, line])
        setProgress((done / totalJobs) * 100)

        if (termRef.current) {
          termRef.current.scrollTop = termRef.current.scrollHeight
        }

        if (done === totalJobs) {
          setStatus('ready')
          timers.push(setTimeout(() => { if (!cancelled) onComplete() }, 600))
        }
      }, job.ms)
      timers.push(timer)
    })

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, cpuLevel])

  return (
    <div className={css.bootBox}>
      <div className={css.bootBar}>
        <div className={css.dots}>
          <span /><span /><span />
        </div>
        <span className={css.pid}>
          nommand:proc{' '}
          <span className={clsx(css.pidStatus, status === 'ready' && css.pidStatusDone)}>
            {status}
          </span>
        </span>
      </div>

      <div className={css.term} ref={termRef}>
        {lines.map((line, i) => (
          <div key={i} className={css.tl}>
            <span className={css.tlTs}>[{line.ts}]</span>
            <span className={line.cls === 'warn' ? css.tlWarn : line.cls === 'success' ? css.tlSuccess : undefined}>
              {line.text}
            </span>
          </div>
        ))}
      </div>

      <div className={css.progWrap}>
        <div className={css.progFill} style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
