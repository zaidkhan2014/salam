import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/useAuth'
import { routes } from '@/router/paths'
import { cn } from '@/lib/cn'

type LoginMode = 'staff' | 'bootstrap'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, staffLogin } = useAuth()
  const [mode, setMode] = useState<LoginMode>('staff')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [adminUserId, setAdminUserId] = useState('')
  const [adminSecret, setAdminSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (mode === 'staff') {
        await staffLogin({ email, password })
      } else {
        await login({ adminUserId, adminSecret })
      }
      navigate(routes.overview)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please check credentials and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">Admin Sign In</CardTitle>
          <div className="mt-3 flex rounded-lg border border-slate-200 p-1">
            <button
              type="button"
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition',
                mode === 'staff' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50',
              )}
              onClick={() => setMode('staff')}
            >
              Staff
            </button>
            <button
              type="button"
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition',
                mode === 'bootstrap' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50',
              )}
              onClick={() => setMode('bootstrap')}
            >
              Bootstrap
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={handleSubmit}>
            {mode === 'staff' ? (
              <>
                <label className="block text-sm text-slate-600">
                  <span className="mb-1 block">Email</span>
                  <Input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="sales1@qalbi.co.in"
                    aria-label="staff-email"
                  />
                </label>
                <label className="block text-sm text-slate-600">
                  <span className="mb-1 block">Password</span>
                  <Input
                    required
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter password"
                    aria-label="staff-password"
                  />
                </label>
              </>
            ) : (
              <>
                <label className="block text-sm text-slate-600">
                  <span className="mb-1 block">Admin User ID</span>
                  <Input
                    required
                    value={adminUserId}
                    onChange={(event) => setAdminUserId(event.target.value)}
                    placeholder="admin-super-1"
                    aria-label="admin-user-id"
                  />
                </label>
                <label className="block text-sm text-slate-600">
                  <span className="mb-1 block">Admin Secret</span>
                  <Input
                    required
                    type="password"
                    value={adminSecret}
                    onChange={(event) => setAdminSecret(event.target.value)}
                    placeholder="Enter shared secret"
                    aria-label="admin-secret"
                  />
                </label>
              </>
            )}
            {error ? <Alert className="border-red-200 bg-red-50 text-red-700">{error}</Alert> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
