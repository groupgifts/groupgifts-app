'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Logo from '@/components/Logo'

export default function ConnectReturn() {
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'complete' | 'incomplete'>('checking')

  useEffect(() => {
    verify()
  }, [])

  async function verify() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const res = await fetch('/api/stripe-connect/callback', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      setStatus(data.complete ? 'complete' : 'incomplete')
    } catch {
      setStatus('incomplete')
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F3F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-center">
        <Logo />
      </nav>
      <main className="max-w-lg mx-auto px-6 py-16 text-center">
        <div className="bg-white rounded-2xl p-10 border border-gray-100">
          {status === 'checking' && (
            <>
              <div className="text-3xl mb-4">⏳</div>
              <p className="text-gray-400 text-sm">Verifying your account...</p>
            </>
          )}

          {status === 'complete' && (
            <>
              <div className="text-4xl mb-4">🎉</div>
              <h1 className="text-2xl font-light italic mb-2" style={{fontFamily: 'Georgia, serif'}}>
                You're all set!
              </h1>
              <p className="text-gray-400 text-sm mb-8">
                Your bank account is connected. When you close a pool, funds will be transferred to you automatically within 2 business days.
              </p>
              <button onClick={() => router.push('/dashboard')}
                className="w-full bg-[#E8733A] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#C85E28] transition-colors">
                Go to dashboard →
              </button>
            </>
          )}

          {status === 'incomplete' && (
            <>
              <div className="text-4xl mb-4">⚠️</div>
              <h1 className="text-2xl font-light italic mb-2" style={{fontFamily: 'Georgia, serif'}}>
                Setup incomplete
              </h1>
              <p className="text-gray-400 text-sm mb-8">
                Your account setup isn't complete yet. Please finish connecting your bank account to receive payouts.
              </p>
              <button onClick={() => router.push('/connect')}
                className="w-full bg-[#E8733A] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#C85E28] transition-colors">
                Continue setup →
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
