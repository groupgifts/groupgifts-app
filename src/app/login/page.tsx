'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/auth'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signIn(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F3F0] flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-sm border border-gray-100">
        <h1 className="text-2xl font-light italic mb-1" style={{fontFamily: 'Georgia, serif'}}>
          Welcome back
        </h1>
        <p className="text-gray-400 text-sm mb-6">Sign in to manage your pools.</p>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E8733A]"
              placeholder="you@email.com" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E8733A]"
              placeholder="Your password" />
          </div>
          <button type="submit" disabled={loading}
            className="bg-[#E8733A] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#C85E28] transition-colors disabled:opacity-50 mt-2">
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Do not have an account? <Link href="/signup" className="text-[#E8733A] font-medium">Create one</Link>
        </p>
      </div>
    </main>
  )
}
