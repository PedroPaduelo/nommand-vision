import { useState, useEffect, useCallback } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth.ts'
import { useTranslation } from '@/hooks/useTranslation.ts'
import { useToast } from '@/hooks/useToast.ts'
import css from './Login.module.css'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const toast = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [recoveryMsg, setRecoveryMsg] = useState('')

  useEffect(() => {
    if (user.authenticated && user.onboarded) {
      navigate('/panorama', { replace: true })
    }
  }, [user.authenticated, user.onboarded, navigate])

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    const trimmedEmail = email.trim()

    if (!trimmedEmail || !password) {
      setError(t('login.fillAll'))
      return
    }

    setLoading(true)
    setError('')

    try {
      await new Promise(r => setTimeout(r, 1200))
      const result = await login(trimmedEmail, password)
      if (result?.onboarded) {
        navigate('/panorama', { replace: true })
      } else {
        navigate('/onboarding', { replace: true })
      }
    } catch {
      setError(t('login.error'))
    } finally {
      setLoading(false)
    }
  }, [email, password, login, navigate, t])

  const handleOAuth = useCallback(async (provider: string) => {
    // Stub: OAuth ainda não está implementado
    // Quando implementado, usar OAuth flow real com provider
    toast.warning(t('login.oauthNotAvailable') || 'Login social em breve')
  }, [toast, t])

  const handleForgotPassword = useCallback(() => {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError(t('login.enterEmail'))
      return
    }
    setError('')
    setRecoveryMsg(t('login.recoveryLink', { email: trimmedEmail }))
    setTimeout(() => setRecoveryMsg(''), 4000)
  }, [email, t])

  return (
    <>
      <div className="ambient-glow glow-1" />
      <div className="ambient-glow glow-2" />

      <div className={css.loginPage}>
        <div className={css.loginBox}>
          <div className={css.loginLogo}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 22h20L12 2Z" fill="currentColor" />
            </svg>
            NOMMAND
          </div>

          <div className={css.loginTitle}>{t('login.welcomeBack')}</div>
          <div className={css.loginSub}>{t('login.subtitle')}</div>

          {error && <div className={css.loginError}>{error}</div>}
          {recoveryMsg && <div className={css.recoveryMsg}>{recoveryMsg}</div>}

          <form className={css.loginForm} onSubmit={handleSubmit}>
            <div className={css.loginField}>
              <label>{t('login.email')}</label>
              <input
                type="email"
                placeholder="seu@email.com"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className={css.loginField}>
              <label>{t('login.password')}</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button
              type="button"
              className={css.loginForgot}
              onClick={handleForgotPassword}
            >
              {t('login.forgotPassword')}
            </button>

            <button
              type="submit"
              className={css.loginBtn}
              disabled={loading}
            >
              {loading ? t('login.loggingIn') : t('login.loginBtn')}
            </button>
          </form>

          <div className={css.loginDivider}>{t('login.orContinueWith')}</div>

          <div className={css.loginOauth}>
            <button
              className={css.loginOauthBtn}
              onClick={() => handleOAuth('github')}
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </button>

            <button
              className={css.loginOauthBtn}
              onClick={() => handleOAuth('google')}
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
          </div>

          <div className={css.loginFooter}>
            <span>{t('login.noAccount')}</span>{' '}
            <Link to="/onboarding">{t('login.createAccount')}</Link>
          </div>
        </div>
      </div>
    </>
  )
}
