import { createBrowserRouter, Navigate, useRouteError, Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { lazy, Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth.ts'
import AppShell from '@/components/templates/AppShell/index.tsx'
import { ErrorBoundary } from '@/components/molecules/ErrorBoundary/index.tsx'

const Login = lazy(() => import('@/pages/Login/index.tsx'))
const Onboarding = lazy(() => import('@/pages/Onboarding/index.tsx'))
const Panorama = lazy(() => import('@/pages/Panorama/index.tsx'))
const Projetos = lazy(() => import('@/pages/Projetos/index.tsx'))
const ProjetoDetalhe = lazy(() => import('@/pages/ProjetoDetalhe/index.tsx'))
const Inbox = lazy(() => import('@/pages/Inbox/index.tsx'))
const Analytics = lazy(() => import('@/pages/Analytics/index.tsx'))
const Deploys = lazy(() => import('@/pages/Deploys/index.tsx'))
const NommandAI = lazy(() => import('@/pages/NommandAI/index.tsx'))
const Agentes = lazy(() => import('@/pages/Agentes/index.tsx'))
const Logs = lazy(() => import('@/pages/Logs/index.tsx'))
const Automacoes = lazy(() => import('@/pages/Automacoes/index.tsx'))
const Marketplace = lazy(() => import('@/pages/Marketplace/index.tsx'))
const Playground = lazy(() => import('@/pages/Playground/index.tsx'))
const Status = lazy(() => import('@/pages/Status/index.tsx'))
const Perfil = lazy(() => import('@/pages/Perfil/index.tsx'))
const Configuracoes = lazy(() => import('@/pages/Configuracoes/index.tsx'))

function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: 200,
      color: 'var(--muted)',
      fontSize: '.85rem',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          width: 24,
          height: 24,
          border: '2px solid var(--border)',
          borderTopColor: 'var(--neon)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <span>Carregando...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )
}

function RouteErrorFallback() {
  const error = useRouteError() as Error
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: 300,
      gap: 16,
      color: 'var(--muted)',
      fontSize: '.9rem',
      padding: 32,
      textAlign: 'center',
    }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--foreground)' }}>
        Algo deu errado
      </div>
      <div>{error?.message || 'Ocorreu um erro inesperado.'}</div>
      <Link
        to="/panorama"
        style={{
          marginTop: 8,
          padding: '8px 20px',
          background: 'var(--neon)',
          color: '#000',
          borderRadius: 6,
          textDecoration: 'none',
          fontWeight: 500,
          fontSize: '.85rem',
        }}
      >
        Voltar ao inicio
      </Link>
    </div>
  )
}

function AuthGuard({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user.authenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function OnboardingGuard({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user.onboarded) {
    return <Navigate to="/onboarding" replace />
  }
  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '/onboarding',
    element: (
      <Suspense fallback={<PageLoader />}>
        <Onboarding />
      </Suspense>
    ),
  },
  {
    errorElement: <RouteErrorFallback />,
    element: (
      <ErrorBoundary>
        <AuthGuard>
          <OnboardingGuard>
            <AppShell />
          </OnboardingGuard>
        </AuthGuard>
      </ErrorBoundary>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/panorama" replace />,
      },
      {
        path: '/panorama',
        errorElement: <RouteErrorFallback />,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Panorama />
          </Suspense>
        ),
      },
      {
        path: '/projetos',
        errorElement: <RouteErrorFallback />,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Projetos />
          </Suspense>
        ),
      },
      {
        path: '/projetos/:slug',
        errorElement: <RouteErrorFallback />,
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProjetoDetalhe />
          </Suspense>
        ),
      },
      {
        path: '/inbox',
        errorElement: <RouteErrorFallback />,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Inbox />
          </Suspense>
        ),
      },
      {
        path: '/analytics',
        errorElement: <RouteErrorFallback />,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Analytics />
          </Suspense>
        ),
      },
      {
        path: '/deploys',
        errorElement: <RouteErrorFallback />,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Deploys />
          </Suspense>
        ),
      },
      {
        path: '/nommand-ai',
        errorElement: <RouteErrorFallback />,
        element: (
          <Suspense fallback={<PageLoader />}>
            <NommandAI />
          </Suspense>
        ),
      },
      {
        path: '/agentes',
        errorElement: <RouteErrorFallback />,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Agentes />
          </Suspense>
        ),
      },
      {
        path: '/logs',
        errorElement: <RouteErrorFallback />,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Logs />
          </Suspense>
        ),
      },
      {
        path: '/automacoes',
        errorElement: <RouteErrorFallback />,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Automacoes />
          </Suspense>
        ),
      },
      {
        path: '/marketplace',
        errorElement: <RouteErrorFallback />,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Marketplace />
          </Suspense>
        ),
      },
      {
        path: '/playground',
        errorElement: <RouteErrorFallback />,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Playground />
          </Suspense>
        ),
      },
      {
        path: '/status',
        errorElement: <RouteErrorFallback />,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Status />
          </Suspense>
        ),
      },
      {
        path: '/perfil',
        errorElement: <RouteErrorFallback />,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Perfil />
          </Suspense>
        ),
      },
      {
        path: '/configuracoes',
        errorElement: <RouteErrorFallback />,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Configuracoes />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/panorama" replace />,
  },
])
