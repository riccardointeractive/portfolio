'use client'

import { useState, useEffect } from 'react'
import { Lock, Unlock, Eye, EyeOff, ShieldCheck, AlertTriangle, Clock } from 'lucide-react'
import {
  authenticate,
  isLockedOut,
  getLockoutRemaining,
  getAttemptCount,
  MAX_LOGIN_ATTEMPTS,
} from '../utils/adminAuth'
import { siteConfig } from '@/config/site'

interface LoginFormProps {
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lockoutTime, setLockoutTime] = useState(0)

  useEffect(() => {
    const checkLockout = () => {
      if (isLockedOut()) {
        setLockoutTime(getLockoutRemaining())
      } else {
        setLockoutTime(0)
      }
    }

    checkLockout()
    const interval = setInterval(() => {
      if (lockoutTime > 0) {
        const remaining = getLockoutRemaining()
        setLockoutTime(remaining)
        if (remaining === 0) setError('')
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [lockoutTime])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (lockoutTime > 0 || !password) return

    setError('')
    setIsSubmitting(true)

    try {
      const result = await authenticate(password)
      if (result.success) {
        onSuccess()
        setPassword('')
      } else {
        setError(result.message)
        setPassword('')
        if (isLockedOut()) setLockoutTime(getLockoutRemaining())
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const attemptsRemaining = MAX_LOGIN_ATTEMPTS - getAttemptCount()
  const isLocked = lockoutTime > 0

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-elevated border border-border-default">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-2 font-display text-4xl font-semibold tracking-tight text-primary">
            Admin Access
          </h1>
          <p className="text-secondary">{siteConfig.name} — Secure authentication required</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border-default bg-surface p-8"
        >
          <div className="mb-6">
            <label htmlFor="password" className="mb-3 block text-sm font-semibold text-primary">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLocked || isSubmitting}
                className="w-full rounded-xl border border-border-default bg-elevated px-4 py-3 pr-12 text-primary placeholder-tertiary transition-all focus:border-border-active focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={isLocked ? 'Please wait...' : 'Enter admin password'}
                autoComplete="current-password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary transition-colors hover:text-primary"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Lockout Timer */}
          {isLocked && (
            <div className="mb-6 rounded-xl border border-border-default bg-elevated p-4">
              <div className="flex items-center gap-3">
                <Clock size={20} className="shrink-0 text-secondary" />
                <div>
                  <div className="text-sm font-medium text-primary">Account Temporarily Locked</div>
                  <div className="mt-1 text-xs text-tertiary">
                    Try again in: <span className="font-mono">{formatTime(lockoutTime)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && !isLocked && (
            <div className="mb-6 rounded-xl border border-border-default bg-elevated p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="mt-0.5 shrink-0 text-secondary" />
                <div className="text-sm text-primary">{error}</div>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLocked || !password || isSubmitting}
            className="group relative w-full overflow-hidden rounded-xl bg-primary px-6 py-4 font-semibold text-base transition-all duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isSubmitting ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-base border-t-transparent" />
                  Authenticating...
                </>
              ) : isLocked ? (
                <>
                  <Lock size={20} />
                  Access Locked
                </>
              ) : (
                <>
                  <Unlock size={20} />
                  Access Admin Panel
                </>
              )}
            </span>
          </button>
        </form>

        {/* Security Info */}
        <div className="mt-6 rounded-xl border border-border-default bg-surface p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck size={20} className="mt-0.5 shrink-0 text-secondary" />
            <div className="text-xs text-tertiary">
              <div className="mb-1 font-semibold text-secondary">Security Features</div>
              <div className="space-y-0.5">
                <div>• Server-side PBKDF2 password verification</div>
                <div>• {MAX_LOGIN_ATTEMPTS} attempts before 15-min lockout</div>
                <div>• Timing-safe comparison</div>
                <div>• Session expires after 24 hours</div>
              </div>
            </div>
          </div>
        </div>

        {/* Attempts counter */}
        {!isLocked && attemptsRemaining < MAX_LOGIN_ATTEMPTS && attemptsRemaining > 0 && (
          <div className="mt-4 text-center text-sm text-tertiary">
            {attemptsRemaining} login attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
          </div>
        )}
      </div>
    </div>
  )
}
