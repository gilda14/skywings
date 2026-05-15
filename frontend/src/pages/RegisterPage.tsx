import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register(fullName, email, password)
      navigate('/search')
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
      if (typeof detail === 'string') {
        setError(detail)
      } else if (Array.isArray(detail) && detail.length > 0 && typeof detail[0]?.msg === 'string') {
        setError(detail[0].msg)
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-primary to-blue-900 text-white items-center justify-center p-8">
        <div className="max-w-sm">
          <div className="text-5xl mb-4">✈</div>
          <h1 className="text-4xl font-extrabold mb-2">SkyWings</h1>
          <p className="text-lg opacity-85">Join millions of happy travellers</p>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-1">Create Account</h2>
          <p className="text-gray-500 mb-6">Start your journey with SkyWings</p>
          <form className="space-y-4" onSubmit={handleRegister}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full Name</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="John Doe" required value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</label>
              <input type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Password</label>
              <input type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="At least 6 characters" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={submitting} className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-primary font-medium hover:underline">Sign in</button>
          </p>
        </div>
      </div>
    </div>
  )
}
