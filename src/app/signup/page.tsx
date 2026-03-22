'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '@/lib/auth'

export default function SignUp() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signUp(email, password, name)
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
          Create your account
        </h1>
        <p className="text-gray-400 text-sm mb-6">Start organising group gifts in minutes.</p>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E8733A]"
              placeholder="First and last name" />
          </div>
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
              placeholder="Min 8 characters" minLength={8} />
          </div>
          <button type="submit" disabled={loading}
            className="bg-[#E8733A] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#C85E28] transition-colors disabled:opacity-50 mt-2">
            {loading ? 'Creating account...' : 'Create account →'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account? <Link href="/login" className="text-[#E8733A] font-medium">Sign in</Link>
        </p>
      </div>
    </main>
  )
}