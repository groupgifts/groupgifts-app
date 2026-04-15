'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Logo from '@/components/Logo'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#F4F3F0] flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-sm border border-gray-100">
        <div className="flex justify-center mb-6"><Logo /></div>

        {sent ? (
          <div className="text-center">
            <div className="text-4xl mb-4">📬</div>
            <h2 className="text-xl font-light italic mb-2" style={{fontFamily: 'Georgia, serif'}}>Check your inbox</h2>
            <p className="text-gray-400 text-sm mb-6">We sent a password reset link to <strong>{email}</strong>.</p>
            <Link href="/login" className="text-[#E8733A] text-sm font-medium">Back to sign in</Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-light italic mb-1" style={{fontFamily: 'Georgia, serif'}}>Forgot password?</h1>
            <p className="text-gray-400 text-sm mb-6">Enter your email and we'll send you a reset link.</p>

            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E8733A]"
                  placeholder="you@email.com" />
              </div>
              <button type="submit" disabled={loading}
                className="bg-[#E8733A] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#C85E28] transition-colors disabled:opacity-50 mt-2">
                {loading ? 'Sending...' : 'Send reset link →'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-6">
              <Link href="/login" className="text-[#E8733A] font-medium">Back to sign in</Link>
            </p>
          </>
        )}
      </div>
    </main>
  )
}
