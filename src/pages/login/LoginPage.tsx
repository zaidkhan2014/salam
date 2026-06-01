import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/useAuth'
import { routes } from '@/router/paths'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [adminUserId, setAdminUserId] = useState('')
  const [adminSecret, setAdminSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await login({ adminUserId, adminSecret })
      navigate(routes.overview)
    } catch {
      setError('Unable to sign in. Please check credentials and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">Admin Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={handleSubmit}>
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
