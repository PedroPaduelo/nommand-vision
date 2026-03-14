import { useState } from 'react'
import clsx from 'clsx'
import type { Project } from './index.tsx'
import { useTranslation } from '@/hooks/useTranslation.ts'
import css from './ProjetoDetalhe.module.css'

interface CodeFile {
  path: string
  lines: string[]
}

const codeFiles: Record<string, CodeFile> = {
  'page.tsx': {
    path: 'src/page.tsx',
    lines: [
      'import { Hero } from \'./components/Hero\'',
      'import { Header } from \'./components/Header\'',
      'import { Footer } from \'./components/Footer\'',
      '',
      '// Landing Page v2 \u2014 managed by Nommand agents',
      'export default function Page() {',
      '  return (',
      '    <main className="min-h-screen">',
      '      <Header />',
      '      <Hero',
      '        title="Projete sem limites"',
      '        subtitle="Plataforma de workspace"',
      '      />',
      '      <Footer />',
      '    </main>',
      '  )',
      '}',
    ]
  },
  'Hero.tsx': {
    path: 'src/components/Hero.tsx',
    lines: [
      'interface HeroProps {',
      '  title: string',
      '  subtitle: string',
      '}',
      '',
      'export function Hero({ title, subtitle }: HeroProps) {',
      '  return (',
      '    <section className="py-24 text-center">',
      '      <h1 className="text-5xl font-bold">',
      '        {title}',
      '      </h1>',
      '      <p className="text-gray-400 mt-4">',
      '        {subtitle}',
      '      </p>',
      '      <button className="btn-primary mt-8">',
      '        Comecar Agora',
      '      </button>',
      '    </section>',
      '  )',
      '}',
    ]
  },
  'Header.tsx': {
    path: 'src/components/Header.tsx',
    lines: [
      'import Link from \'next/link\'',
      '',
      'export function Header() {',
      '  return (',
      '    <header className="flex justify-between p-6">',
      '      <div className="font-bold tracking-wider">',
      '        NOMMAND',
      '      </div>',
      '      <nav className="flex gap-6">',
      '        <Link href="/">Home</Link>',
      '        <Link href="/about">About</Link>',
      '        <Link href="/docs">Docs</Link>',
      '      </nav>',
      '    </header>',
      '  )',
      '}',
    ]
  },
  'Footer.tsx': {
    path: 'src/components/Footer.tsx',
    lines: [
      'export function Footer() {',
      '  return (',
      '    <footer className="border-t py-8 text-center">',
      '      <p className="text-sm text-gray-500">',
      '        \u00a9 2025 Nommand. All rights reserved.',
      '      </p>',
      '    </footer>',
      '  )',
      '}',
    ]
  },
  'api.ts': {
    path: 'src/lib/api.ts',
    lines: [
      'const API_URL = process.env.NEXT_PUBLIC_API_URL',
      '',
      'export async function fetcher<T>(endpoint: string): Promise<T> {',
      '  const res = await fetch(`${API_URL}${endpoint}`, {',
      '    headers: {',
      '      \'Content-Type\': \'application/json\',',
      '    },',
      '    next: { revalidate: 60 },',
      '  })',
      '',
      '  if (!res.ok) {',
      '    throw new Error(`API error: ${res.status}`)',
      '  }',
      '',
      '  return res.json()',
      '}',
    ]
  },
  'utils.ts': {
    path: 'src/lib/utils.ts',
    lines: [
      'import { clsx, ClassValue } from \'clsx\'',
      'import { twMerge } from \'tailwind-merge\'',
      '',
      'export function cn(...inputs: ClassValue[]) {',
      '  return twMerge(clsx(inputs))',
      '}',
      '',
      'export function formatDate(date: Date): string {',
      '  return new Intl.DateTimeFormat(\'pt-BR\', {',
      '    day: \'numeric\',',
      '    month: \'short\',',
      '    year: \'numeric\',',
      '  }).format(date)',
      '}',
    ]
  },
  'globals.css': {
    path: 'src/globals.css',
    lines: [
      '@tailwind base;',
      '@tailwind components;',
      '@tailwind utilities;',
      '',
      ':root {',
      '  --background: #000;',
      '  --foreground: #fff;',
      '  --accent: #eab308;',
      '}',
      '',
      'body {',
      '  background: var(--background);',
      '  color: var(--foreground);',
      '  font-family: \'Inter\', sans-serif;',
      '}',
    ]
  },
  'package.json': {
    path: 'package.json',
    lines: [
      '{',
      '  "name": "landing-page-v2",',
      '  "version": "2.4.1",',
      '  "private": true,',
      '  "scripts": {',
      '    "dev": "next dev",',
      '    "build": "next build",',
      '    "start": "next start",',
      '    "lint": "next lint",',
      '    "test": "vitest"',
      '  },',
      '  "dependencies": {',
      '    "next": "14.2.0",',
      '    "react": "18.3.1",',
      '    "framer-motion": "11.0.0"',
      '  }',
      '}',
    ]
  },
}

interface TreeItem {
  name: string
  icon: string
  dir?: boolean
  indent: number
  active?: boolean
}

const treeItems: TreeItem[] = [
  { name: 'src', icon: '\ud83d\udcc1', dir: true, indent: 0 },
  { name: 'components', icon: '\ud83d\udcc1', dir: true, indent: 1 },
  { name: 'Header.tsx', icon: 'TS', indent: 2 },
  { name: 'Hero.tsx', icon: 'TS', indent: 2 },
  { name: 'Footer.tsx', icon: 'TS', indent: 2 },
  { name: 'lib', icon: '\ud83d\udcc1', dir: true, indent: 1 },
  { name: 'api.ts', icon: 'TS', indent: 2 },
  { name: 'utils.ts', icon: 'TS', indent: 2 },
  { name: 'page.tsx', icon: 'TS', indent: 1, active: true },
  { name: 'globals.css', icon: 'CS', indent: 1 },
  { name: 'package.json', icon: 'JS', indent: 0 },
]

export default function CodigoTab({ project }: { project: Project }) {
  const { t } = useTranslation()
  const [activeFile, setActiveFile] = useState('page.tsx')
  const current = codeFiles[activeFile]

  return (
    <div className={css.codeGrid}>
      <div className={css.fileTree}>
        <div className={css.fileTreeHeader}>
          <span>{t('common.files')}</span>
          <span>{project.branch}</span>
        </div>
        {treeItems.map((f, i) => {
          const indentCls = f.indent === 1 ? css.fileIndent1 : f.indent === 2 ? css.fileIndent2 : ''
          const dirCls = f.dir ? css.fileIconDir : ''
          const activeCls = !f.dir && f.name === activeFile ? css.fileItemActive : ''
          return (
            <div
              key={i}
              className={clsx(css.fileItem, indentCls, activeCls)}
              onClick={() => { if (!f.dir && codeFiles[f.name]) setActiveFile(f.name) }}
            >
              <span className={clsx(css.fileIcon, dirCls)}>{f.icon}</span> {f.name}
            </div>
          )
        })}
      </div>
      <div className={css.codePreview}>
        <div className={css.codePreviewHeader}>
          <span>{current?.path}</span>
          <span>{current?.lines.length} {t('common.lines')}</span>
        </div>
        <pre className={css.codePreviewBody}>
          {current?.lines.map((line, i) => (
            <span key={i}><span className={css.ln}>{i + 1}</span>{line}{'\n'}</span>
          ))}
        </pre>
      </div>
    </div>
  )
}
