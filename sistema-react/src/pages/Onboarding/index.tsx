import { useState, useEffect, useCallback, useRef } from 'react'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import type { Role } from '@/types/index.ts'
import { useAuth } from '@/hooks/useAuth.ts'
import { useTranslation } from '@/hooks/useTranslation.ts'
import HeroView from './HeroView.tsx'
import RoleView from './RoleView.tsx'
import ChatView from './ChatView.tsx'
import TerminalView from './TerminalView.tsx'
import css from './Onboarding.module.css'

function fireConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const colors = ['#60a5fa', '#10b981', '#c026d3', '#f59e0b', '#8b5cf6', '#fff', '#22c55e']
  const pieces: {
    x: number; y: number; vx: number; vy: number
    w: number; h: number; color: string
    rotation: number; rv: number; gravity: number; opacity: number
  }[] = []

  for (let i = 0; i < 120; i++) {
    pieces.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: -Math.random() * 18 - 4,
      w: Math.random() * 8 + 4,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rv: (Math.random() - 0.5) * 12,
      gravity: 0.35 + Math.random() * 0.15,
      opacity: 1,
    })
  }

  let frame = 0
  function draw() {
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    let alive = false
    pieces.forEach(p => {
      p.x += p.vx
      p.vy += p.gravity
      p.y += p.vy
      p.rotation += p.rv
      p.vx *= 0.99
      if (frame > 40) p.opacity -= 0.015
      if (p.opacity <= 0) return
      alive = true
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate((p.rotation * Math.PI) / 180)
      ctx.globalAlpha = Math.max(0, p.opacity)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      ctx.restore()
    })
    frame++
    if (alive && frame < 200) requestAnimationFrame(draw)
    else ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
  requestAnimationFrame(draw)
}

export default function Onboarding() {
  const { user, completeOnboarding } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [view, setView] = useState(0)
  const [prevView, setPrevView] = useState(-1)
  const [role, setRole] = useState<Role>('Frontend')
  const [stack, setStack] = useState<string[]>([])
  const [cpuLevel, setCpuLevel] = useState(2)
  const [navigating, setNavigating] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (user.onboarded) {
      navigate('/panorama', { replace: true })
    }
  }, [user.onboarded, navigate])

  const go = useCallback((nextView: number) => {
    if (navigating || nextView === view) return
    setNavigating(true)
    setPrevView(view)

    const delay = nextView > view ? 150 : 0
    setTimeout(() => {
      setView(nextView)
      setNavigating(false)
    }, delay)
  }, [navigating, view])

  const handleRoleSelect = useCallback((selectedRole: Role) => {
    setRole(selectedRole)
    go(2)
  }, [go])

  const handleDeploy = useCallback(() => {
    go(3)
  }, [go])

  const handleTerminalComplete = useCallback(() => {
    completeOnboarding(role, stack, cpuLevel)
    if (canvasRef.current) {
      fireConfetti(canvasRef.current)
    }
    setTimeout(() => {
      navigate('/panorama', { replace: true })
    }, 1500)
  }, [completeOnboarding, role, stack, cpuLevel, navigate])

  function getViewClasses(index: number): string {
    return clsx(
      css.view,
      index === view && !navigating && css.viewActive,
      index === prevView && navigating && view > prevView && css.viewExitUp,
    )
  }

  function getStepText(): string {
    if (view === 3) return t('onboarding.deploying')
    return `0${Math.min(view + 1, 4)} / 04`
  }

  return (
    <>
      <div className="ambient-glow glow-1" />
      <div className="ambient-glow glow-2" />
      <div className="ambient-glow glow-3" />

      <canvas ref={canvasRef} className={css.confettiCanvas} />

      <div className={css.appWrapper}>
        <header className={css.topNav}>
          <div className={css.logo}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 22h20L12 2Z" fill="currentColor" opacity="0.8" />
              <path d="M12 8l-6 12h12L12 8Z" fill="var(--bg)" />
            </svg>
            <span>NOMMAND</span>
          </div>
          <div className={css.topRight}>
            <div className={css.progressPills}>
              {[0, 1, 2, 3].map(i => (
                <span
                  key={i}
                  className={clsx(css.pill, i === view && css.pillActive, i < view && css.pillDone)}
                />
              ))}
            </div>
            <span className={css.stepIndicator}>{getStepText()}</span>
          </div>
        </header>

        <main className={css.viewManager}>
          <section className={getViewClasses(0)}>
            {view === 0 && <HeroView onAdvance={() => go(1)} />}
          </section>

          <section className={getViewClasses(1)}>
            {(view === 1 || prevView === 1) && <RoleView onSelect={handleRoleSelect} />}
          </section>

          <section className={getViewClasses(2)}>
            {(view === 2 || prevView === 2) && (
              <ChatView
                role={role}
                stack={stack}
                cpuLevel={cpuLevel}
                onUpdateStack={setStack}
                onUpdateCpu={setCpuLevel}
                onDeploy={handleDeploy}
              />
            )}
          </section>

          <section className={getViewClasses(3)}>
            {view === 3 && (
              <TerminalView
                role={role}
                stack={stack}
                cpuLevel={cpuLevel}
                onComplete={handleTerminalComplete}
              />
            )}
          </section>
        </main>
      </div>
    </>
  )
}
