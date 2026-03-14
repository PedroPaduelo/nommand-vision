import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/stores/AuthContext.tsx'
import { ThemeProvider } from '@/stores/ThemeContext.tsx'
import { I18nProvider } from '@/stores/I18nContext.tsx'
import { ToastProvider } from '@/stores/ToastContext.tsx'
import { ConfirmProvider } from '@/stores/ConfirmContext.tsx'
import AppShell from '../AppShell/index.tsx'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <I18nProvider>
              <ToastProvider>
                <ConfirmProvider>
                  <MemoryRouter>
                    {children}
                  </MemoryRouter>
                </ConfirmProvider>
              </ToastProvider>
            </I18nProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    )
  }
}

describe('AppShell', () => {
  it('renders without crashing when wrapped with required providers', () => {
    const Wrapper = createWrapper()
    const { container } = render(
      <Wrapper>
        <AppShell />
      </Wrapper>
    )
    expect(container).toBeTruthy()
  })
})
