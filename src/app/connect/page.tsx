'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Logo from '@/components/Logo'

function ConnectInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (searchParams.get('refresh') === '1') {
      startOnboarding()
    }
  }, [])

  async function startOnboarding() {
    setLoading(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const res = await fetch('/api/stripe-connect/onboard', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-10 border border-gray-100">
      <div className="text-4xl mb-4">🏦</div>
      <h1 className="text-2xl font-light italic mb-2" style={{fontFamily: 'Georgia, serif'}}>
        Connect your bank account
      </h1>
      <p className="text-gray-400 text-sm mb-8">
        To receive funds when you close a pool, you need to connect a bank account via Stripe.
        It only takes a few minutes and is fully secure.
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6">
          {error.replace(/https?:\/\/\S+/g, '').trim()}{' '}
          {error.match(/https?:\/\/\S+/) && (
            <a href={error.match(/https?:\/\/\S+/)![0]} target="_blank" rel="noopener noreferrer"
              className="underline font-medium">
              {error.match(/https?:\/\/\S+/)![0]}
            </a>
          )}
        </div>
      )}

      <button onClick={startOnboarding} disabled={loading}
        className="w-full bg-[#E8733A] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#C85E28] transition-colors disabled:opacity-50">
        {loading ? 'Redirecting to Stripe...' : 'Connect bank account →'}
      </button>

      <button onClick={() => router.push('/dashboard')}
        className="w-full mt-3 text-gray-400 text-sm hover:text-gray-600">
        Do this later
      </button>
    </div>
  )
}

export default function ConnectPage() {
  return (
    <div className="min-h-screen bg-[#F4F3F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-center">
        <Logo />
      </nav>
      <main className="max-w-lg mx-auto px-6 py-16 text-center">
        <Suspense fallback={<div className="text-gray-400 text-sm">Loading...</div>}>
          <ConnectInner />
        </Suspense>
      </main>
    </div>
  )
}
