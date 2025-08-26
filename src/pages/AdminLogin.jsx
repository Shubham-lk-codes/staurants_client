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
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <form
        onSubmit={login}
        className="w-full max-w-sm bg-[#1a1a1a] p-8 rounded-2xl shadow-lg border border-orange-500"
      >
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src="/logo.jpg" alt="Patrika Cafe" className="h-20 w-20 rounded-full shadow-md border-2 border-orange-500" />
        </div>

        <h1 className="text-2xl font-bold mb-6 text-center text-orange-500">
          Patrika Café Staff Login
        </h1>

        <label className="block mb-2 text-sm text-gray-300">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-600 bg-black text-white rounded px-3 py-2 mb-4 focus:ring-2 focus:ring-orange-500 focus:outline-none"
          placeholder="Enter your email"
        />

        <label className="block mb-2 text-sm text-gray-300">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-600 bg-black text-white rounded px-3 py-2 mb-4 focus:ring-2 focus:ring-orange-500 focus:outline-none"
          placeholder="Enter your password"
        />

        {error && <div className="text-red-500 text-sm mb-3">{error}</div>}

        <button
          disabled={loading}
          className="w-full py-2 rounded-lg bg-orange-500 hover:bg-orange-600 transition-colors text-black font-semibold shadow-md"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
