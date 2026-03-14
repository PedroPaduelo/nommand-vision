import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation.ts'
import css from './Playground.module.css'
import FileTreePanel from './FileTreePanel.tsx'
import type { TreeFile } from './FileTreePanel.tsx'
import EditorPanel from './EditorPanel.tsx'
import type { CodeLine } from './EditorPanel.tsx'
import PreviewPanel from './PreviewPanel.tsx'
import TerminalPanel from './TerminalPanel.tsx'
import type { TermLine } from './TerminalPanel.tsx'

const treeFiles: TreeFile[] = [
  { type: 'folder', name: 'src', indent: 0, open: true },
  { type: 'file', name: 'page.tsx', indent: 1, icon: '\u269b', lang: 'TypeScript JSX' },
  { type: 'file', name: 'layout.tsx', indent: 1, icon: '\u269b', lang: 'TypeScript JSX' },
  { type: 'file', name: 'globals.css', indent: 1, icon: '\ud83c\udfa8', lang: 'CSS' },
  { type: 'folder', name: 'components', indent: 1 },
  { type: 'file', name: 'Hero.tsx', indent: 2, icon: '\u269b', lang: 'TypeScript JSX' },
  { type: 'file', name: 'Button.tsx', indent: 2, icon: '\u269b', lang: 'TypeScript JSX' },
  { type: 'folder', name: 'lib', indent: 1 },
  { type: 'file', name: 'utils.ts', indent: 2, icon: '\ud83d\udcd8', lang: 'TypeScript' },
  { type: 'file', name: 'package.json', indent: 0, icon: '\ud83d\udce6', lang: 'JSON' },
  { type: 'file', name: 'tailwind.config.ts', indent: 0, icon: '\u2699', lang: 'TypeScript' },
  { type: 'file', name: 'next.config.js', indent: 0, icon: '\u2699', lang: 'JavaScript' },
]

const initialCodeMap: Record<string, string[]> = {
  'page.tsx': [
    "import { Hero } from './components/Hero'",
    "import { Button } from './components/Button'",
    '',
    'export default function Page() {',
    '  return (',
    '    <main className="min-h-screen">',
    '      <Hero',
    '        title="Projete sem limites"',
    '        subtitle="Plataforma de workspace inteligente"',
    '      />',
    '      <section className="py-20 px-6">',
    '        <h2 className="text-3xl font-bold">',
    '          Features',
    '        </h2>',
    '        <Button variant="primary">',
    '          Comecar Agora',
    '        </Button>',
    '      </section>',
    '    </main>',
    '  )',
    '}',
  ],
  'layout.tsx': [
    "import './globals.css'",
    '',
    'export const metadata = {',
    "  title: 'NOMMAND',",
    "  description: 'Workspace inteligente',",
    '}',
    '',
    'export default function RootLayout({ children }) {',
    '  return (',
    '    <html lang="pt-BR">',
    '      <body>{children}</body>',
    '    </html>',
    '  )',
    '}',
  ],
  'Hero.tsx': [
    'interface HeroProps {',
    '  title: string',
    '  subtitle: string',
    '}',
    '',
    'export function Hero({ title, subtitle }: HeroProps) {',
    '  return (',
    '    <div className="text-center py-24">',
    '      <h1 className="text-5xl font-bold">',
    '        {title}',
    '      </h1>',
    '      <p className="text-gray-400 mt-4">',
    '        {subtitle}',
    '      </p>',
    '    </div>',
    '  )',
    '}',
  ],
  'Button.tsx': [
    'interface ButtonProps {',
    "  variant?: 'primary' | 'secondary'",
    '  children: React.ReactNode',
    '}',
    '',
    "export function Button({ variant = 'primary', children }: ButtonProps) {",
    "  const styles = variant === 'primary'",
    "    ? 'bg-white text-black'",
    "    : 'border border-gray-600 text-white'",
    '',
    '  return (',
    '    <button className={`px-6 py-3 rounded-lg font-semibold ${styles}`}>',
    '      {children}',
    '    </button>',
    '  )',
    '}',
  ],
  'globals.css': [
    '/* Global Styles */',
    '@tailwind base;',
    '@tailwind components;',
    '@tailwind utilities;',
    '',
    ':root {',
    '  --background: #000;',
    '  --foreground: #fff;',
    '}',
    '',
    'body {',
    '  background: var(--background);',
    '  color: var(--foreground);',
    '}',
  ],
  'utils.ts': [
    'export function cn(...classes: string[]) {',
    "  return classes.filter(Boolean).join(' ')",
    '}',
    '',
    'export function formatDate(date: Date) {',
    "  return date.toLocaleDateString('pt-BR')",
    '}',
  ],
}

const fileIcons: Record<string, string> = {
  'page.tsx': '\u269b', 'layout.tsx': '\u269b', 'globals.css': '\ud83c\udfa8',
  'Hero.tsx': '\u269b', 'Button.tsx': '\u269b', 'utils.ts': '\ud83d\udcd8',
  'package.json': '\ud83d\udce6', 'tailwind.config.ts': '\u2699', 'next.config.js': '\u2699',
}

const fileLangs: Record<string, string> = {
  'page.tsx': 'TypeScript JSX', 'layout.tsx': 'TypeScript JSX', 'globals.css': 'CSS',
  'Hero.tsx': 'TypeScript JSX', 'Button.tsx': 'TypeScript JSX', 'utils.ts': 'TypeScript',
  'package.json': 'JSON', 'tailwind.config.ts': 'TypeScript', 'next.config.js': 'JavaScript',
}

const previewHtml = '<h1 style="font-size:1.4rem;font-weight:600;background:linear-gradient(135deg,var(--neon),#c084fc);-webkit-background-clip:text;color:transparent;margin-bottom:.5rem">Projete sem limites</h1><p style="font-size:.82rem;color:var(--muted);line-height:1.5;margin-bottom:1rem">Plataforma de workspace inteligente</p><button style="background:#fff;color:#000;border:none;padding:8px 20px;border-radius:6px;font-size:.8rem;font-weight:600;cursor:pointer">Comecar Agora</button>'

const termCommands: Record<string, string | null> = {
  'ls': '<span style="color:var(--muted)">node_modules/  src/  public/  package.json  tsconfig.json  next.config.js</span>',
  'pwd': '<span style="color:var(--muted)">/home/dev/project</span>',
  'clear': '__CLEAR__',
  'git status': '<span style="color:var(--muted)">On branch main\nChanges not staged for commit:\n  modified:   src/page.tsx</span>',
  'git log --oneline': '<span style="color:var(--muted)">a1b2c3d feat: add hero component\n8e9f0a1 fix: button styles\nd2e3f4a init: project setup</span>',
  'whoami': '<span style="color:var(--muted)">dev</span>',
  'node -v': '<span style="color:var(--muted)">v20.11.0</span>',
  'npm -v': '<span style="color:var(--muted)">10.2.4</span>',
  'help': '__HELP__',
}

export default function Playground() {
  const { t } = useTranslation()
  const [activeFile, setActiveFile] = useState('page.tsx')
  const [openTabs, setOpenTabs] = useState<string[]>(['page.tsx'])
  const [codeMap, setCodeMap] = useState<Record<string, string[]>>(() => ({ ...initialCodeMap }))
  const [aiProcessing, setAiProcessing] = useState(false)
  const [diffState, setDiffState] = useState<Record<number, 'added' | 'removed'>>({})
  const [termLines, setTermLines] = useState<TermLine[]>([])

  useEffect(() => {
    let cancelled = false
    const startup = [
      { html: '<span style="color:var(--neon)">~/project</span> $ npm run dev', delay: 0 },
      { html: `<span style="color:var(--green)">\u2713</span> <span style="color:var(--muted)">${t('playground.startingServer')}</span>`, delay: 400 },
      { html: `<span style="color:var(--green)">\u2713</span> <span style="color:var(--muted)">${t('playground.compiled')}</span>`, delay: 900 },
      { html: `<span style="color:var(--green)">\u2713</span> <span style="color:var(--muted)">${t('playground.readyOn')}</span>`, delay: 1200 },
      { html: `<span style="color:var(--muted)">  \u279c ${t('playground.hotReloadEnabled')}</span>`, delay: 1600 },
    ]
    setTermLines([])
    const timers = startup.map(line =>
      setTimeout(() => {
        if (!cancelled) setTermLines(prev => [...prev, { html: line.html }])
      }, line.delay)
    )
    return () => { cancelled = true; timers.forEach(clearTimeout) }
  }, [])

  const openFile = useCallback((name: string) => {
    if (!codeMap[name]) return
    setActiveFile(name)
    setOpenTabs(prev => prev.includes(name) ? prev : [...prev, name])
    setDiffState({})
  }, [codeMap])

  const closeTab = useCallback((name: string) => {
    setOpenTabs(prev => {
      if (prev.length <= 1) return prev
      const next = prev.filter(t => t !== name)
      if (activeFile === name) setActiveFile(next[next.length - 1])
      return next
    })
  }, [activeFile])

  const addTermLine = useCallback((html: string) => {
    setTermLines(prev => [...prev, { html }])
  }, [])

  const handleCommand = useCallback((cmd: string) => {
    addTermLine(`<span style="color:var(--neon)">~/project</span> $ ${cmd}`)

    if (cmd === 'clear') {
      setTermLines([])
      return
    }

    const result = termCommands[cmd]
    if (result === '__HELP__') {
      setTimeout(() => addTermLine(`<span style="color:var(--muted)">${t('playground.helpCommands')}</span>`), 150)
      return
    }
    if (result) {
      setTimeout(() => addTermLine(result), 150)
      return
    }

    if (cmd.startsWith('npm run')) {
      setTimeout(() => addTermLine(`<span style="color:var(--muted)">${t('playground.termRunning')}</span>`), 200)
      setTimeout(() => {
        const time = (Math.random() * 2 + 0.5).toFixed(1)
        addTermLine(`<span style="color:var(--green)">\u2713</span> <span style="color:var(--muted)">${t('playground.termDoneIn', { time })}</span>`)
      }, 1200)
      return
    }

    if (cmd.startsWith('npm')) {
      setTimeout(() => addTermLine(`<span style="color:var(--muted)">${t('playground.termUpToDate')}</span>`), 500)
      return
    }

    setTimeout(() => {
      addTermLine(`<span style="color:var(--red)">${t('playground.termCommandNotFound', { cmd: cmd.split(' ')[0] })}</span>`)
    }, 100)
  }, [addTermLine, t])

  const handleAiSubmit = useCallback((prompt: string) => {
    setAiProcessing(true)
    addTermLine(`<span style="color:var(--neon)">~/project</span> $ <span style="color:#c084fc">ai "${prompt}"</span>`)
    addTermLine(`<span style="color:#c084fc">\u2b24 Nommand AI:</span> <span style="color:var(--muted)">${t('playground.aiAnalyzing')}</span>`)

    setTimeout(() => {
      setCodeMap(prev => {
        const lines = prev[activeFile]
        if (lines) {
          setDiffState({ 0: 'added' })
          return { ...prev, [activeFile]: [`// AI: ${prompt}`, ...lines] }
        }
        return prev
      })
    }, 1500)

    setTimeout(() => {
      setDiffState({})
      addTermLine(`<span style="color:#c084fc">\u2b24 Nommand AI:</span> <span style="color:var(--green)">\u2713 ${t('playground.aiSuggestionApplied', { file: activeFile })}</span>`)
      addTermLine(`<span style="color:var(--green)">\u2713</span> <span style="color:var(--muted)">${t('playground.hotReloadUpdated')}</span>`)
      setAiProcessing(false)
    }, 2500)
  }, [activeFile, addTermLine, t])

  const currentCode = codeMap[activeFile] || []
  const codeLines: CodeLine[] = currentCode.map((text, i) => ({
    text,
    diff: diffState[i],
  }))

  return (
    <div className={css.pgLayout}>
      <FileTreePanel
        files={treeFiles}
        activeFile={activeFile}
        onFileClick={openFile}
      />
      <EditorPanel
        openTabs={openTabs}
        activeFile={activeFile}
        codeLines={codeLines}
        lang={fileLangs[activeFile] || 'Plain Text'}
        onTabClick={openFile}
        onTabClose={closeTab}
        onAiSubmit={handleAiSubmit}
        aiProcessing={aiProcessing}
        fileIcons={fileIcons}
      />
      <div className={css.pgRightPanel}>
        <PreviewPanel previewHtml={previewHtml} />
        <TerminalPanel lines={termLines} onCommand={handleCommand} />
      </div>
    </div>
  )
}
