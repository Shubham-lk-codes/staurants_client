import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function login(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('admin_token', res.data.token)
      navigate('/admin/dashboard')
    } catch (e) {
      setError('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={login} className="w-full max-w-sm bg-white p-6 rounded-lg shadow">
        <h1 className="text-xl font-semibold mb-4">Staff Login</h1>
        <label className="block mb-2 text-sm">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2 mb-4" />
        <label className="block mb-2 text-sm">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2 mb-4" />
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <button disabled={loading} className="w-full py-2 rounded bg-emerald-600 text-white">{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </div>
  )
}


