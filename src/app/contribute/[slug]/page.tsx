'use client'
import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Logo from '@/components/Logo'

const OCCASION_EMOJI: Record<string, string> = {
  'Birthday': '🎂',
  'Wedding': '💍',
  'Baby Shower': '🍼',
  'Graduation': '🎓',
  'Anniversary': '💝',
  'Retirement': '🥂',
  'Farewell': '✈️',
  'Celebration': '🎉',
}

export default function Contribute() {
  const { slug } = useParams()
  const searchParams = useSearchParams()
  const [pool, setPool] = useState<any>(null)
  const [contributions, setContributions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<'view' | 'contribute' | 'success'>('view')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showAmounts, setShowAmounts] = useState(false)
  const [showMyAmount, setShowMyAmount] = useState(false)

  useEffect(() => {
    loadPool()
    if (searchParams.get('success') === '1') setStep('success')
  }, [slug])

  async function loadPool() {
    const { data: poolData } = await supabase
      .from('pools')
      .select('*')
      .eq('slug', slug)
      .single()

    if (!poolData) { setLoading(false); return }
    setPool(poolData)

    const { data: contribs } = await supabase
      .from('contributions')
      .select('contributor_name, message, amount, created_at')
      .eq('pool_id', poolData.id)
      .eq('status', 'paid')
      .order('created_at', { ascending: false })

    setContributions(contribs || [])
    setLoading(false)
  }

  async function handleContribute() {
    if (!name || !email || !amount) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, name, email, amount, message, showMyAmount }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Checkout failed')
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F4F3F0] flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  )

  if (!pool) return (
    <div className="min-h-screen bg-[#F4F3F0] flex items-center justify-center">
      <div className="text-gray-400 text-sm">Pool not found.</div>
    </div>
  )

  const raised = contributions.reduce((sum, c) => sum + c.amount, 0)
  const pct = Math.min(100, pool.goal > 0 ? Math.round((raised / pool.goal) * 100) : 0)
  const done = pct >= 100

  if (step === 'success') return (
    <div className="min-h-screen bg-[#F4F3F0] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-10 text-center max-w-md w-full border border-gray-100">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-light italic mb-2" style={{fontFamily: 'Georgia, serif'}}>You're in!</h2>
        <p className="text-gray-400 text-sm mb-6">
          Your contribution to <strong>{pool.title}</strong> is confirmed. A receipt is on its way to your email.
        </p>
        <div className="bg-green-50 rounded-xl p-4">
          <div className="text-sm text-green-700 font-semibold mb-2">Pool progress</div>
          <div className="h-2 bg-green-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{width: `${pct}%`}} />
          </div>
          <div className="text-xs text-green-600 mt-2">${raised.toFixed(0)} of ${pool.goal} raised</div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F4F3F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-center">
        <Logo />
      </nav>

      <main className="max-w-lg mx-auto px-6 py-10">

        {/* Pool info */}
        <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold text-[#E8733A] uppercase tracking-wide">{OCCASION_EMOJI[pool.occasion] || '🎁'} {pool.occasion}</span>
            {pool.gift_intent === 'charity' && (
              <span className="text-xs font-semibold bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">🤝 Charity donation</span>
            )}
            {pool.gift_intent === 'open' && (
              <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">💰 No specific gift yet</span>
            )}
            {(pool.gift_intent === 'specific' || !pool.gift_intent) && (
              <span className="text-xs font-semibold bg-orange-50 text-[#E8733A] px-2 py-0.5 rounded-full">🎁 Specific gift in mind</span>
            )}
          </div>
          <h2 className="text-2xl font-light italic mb-1" style={{fontFamily: 'Georgia, serif'}}>{pool.title}</h2>
          <p className="text-gray-400 text-sm mb-4">For {pool.recipient}</p>

          {pool.gift_name && (
            <div className="bg-orange-50 rounded-xl p-3 mb-4">
              <div className="text-xs text-gray-400 mb-1">🎁 Target gift</div>
              <div className="text-sm font-semibold text-gray-900">{pool.gift_name}</div>
            </div>
          )}

          {pool.hide_total ? (
            <div className="flex flex-col gap-1">
              <div className="text-sm text-gray-400">{contributions.length} contributor{contributions.length !== 1 ? 's' : ''} so far</div>
              <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 mt-1">🔒 The organiser has kept the total private</div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold mb-1">${raised.toFixed(0)}</div>
              <div className="text-sm text-gray-400 mb-3">of ${pool.goal} goal</div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full" style={{width: `${pct}%`, background: done ? '#18B894' : '#E8733A'}} />
              </div>
              <div className="text-sm text-gray-400">{pct}% funded · {contributions.length} contributor{contributions.length !== 1 ? 's' : ''}</div>
            </>
          )}
        </div>

        {step === 'view' && (
          <div>
            {!done && (
              <button onClick={() => setStep('contribute')}
                className="w-full bg-[#E8733A] text-white py-4 rounded-xl font-semibold text-base hover:bg-[#C85E28] transition-colors mb-4">
                Chip in →
              </button>
            )}

            {contributions.length > 0 && (
              <div className="flex flex-col gap-3 mt-2">
                <h3 className="font-semibold text-gray-700 text-sm">Already chipped in</h3>
                {contributions.map((c, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#E8733A] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {c.contributor_name[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">{c.contributor_name}</div>
                      {c.message && <div className="text-xs text-gray-400">"{c.message}"</div>}
                    </div>
                    {c.show_amount && (
                      <div className="text-sm font-semibold text-gray-500">${c.amount}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'contribute' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="text-lg font-light italic mb-4" style={{fontFamily: 'Georgia, serif'}}>Add your contribution</h3>

            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your name</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E8733A]"
                  placeholder="First and last name" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email (for receipt)</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E8733A]"
                  placeholder="you@email.com" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount (USD)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E8733A]"
                  placeholder="e.g. 50" min="1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Personal message (optional)</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E8733A] resize-none"
                  placeholder="Write something for the recipient..." />
              </div>
              <label className="flex items-center gap-3 cursor-pointer pt-1">
                <input type="checkbox" checked={showMyAmount} onChange={e => setShowMyAmount(e.target.checked)}
                  className="rounded accent-[#E8733A]" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Show my contribution amount</div>
                  <div className="text-xs text-gray-400">Others can see how much you contributed</div>
                </div>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep('view')} className="flex-1 border border-gray-200 text-gray-500 py-3 rounded-xl text-sm font-semibold">
                ← Back
              </button>
              <button onClick={handleContribute} disabled={submitting || !name || !email || !amount}
                className="flex-1 bg-[#E8733A] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#C85E28] transition-colors disabled:opacity-50">
                {submitting ? 'Redirecting to payment...' : `Pay $${amount || '0'} →`}
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-3">Secured by Stripe</p>
          </div>
        )}
      </main>
    </div>
  )
}
