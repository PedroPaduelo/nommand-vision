import { RouterProvider } from 'react-router-dom'
import { ErrorBoundary } from '@/components/molecules/ErrorBoundary'
import { AppProviders } from '@/providers/AppProviders'
import { router } from '@/router.tsx'

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </ErrorBoundary>
  )
}
