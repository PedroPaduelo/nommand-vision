export function fireConfetti(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const colors = ['#60a5fa', '#10b981', '#c026d3', '#f59e0b', '#8b5cf6', '#fff', '#22c55e']

  interface Piece {
    x: number
    y: number
    vx: number
    vy: number
    w: number
    h: number
    color: string
    rotation: number
    rv: number
    gravity: number
    opacity: number
  }

  const pieces: Piece[] = []
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
      opacity: 1
    })
  }

  let frame = 0

  function draw() {
    ctx!.clearRect(0, 0, canvas.width, canvas.height)
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

      ctx!.save()
      ctx!.translate(p.x, p.y)
      ctx!.rotate(p.rotation * Math.PI / 180)
      ctx!.globalAlpha = Math.max(0, p.opacity)
      ctx!.fillStyle = p.color
      ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      ctx!.restore()
    })

    frame++
    if (alive && frame < 200) {
      requestAnimationFrame(draw)
    } else {
      ctx!.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  requestAnimationFrame(draw)
}
