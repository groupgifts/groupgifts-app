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

  const myAmount = parseFloat(searchParams.get('amount') || '0')

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
          <div className="text-sm text-green-700 font-semibold mb-2">Your contribution</div>
          <div className="text-2xl font-bold text-green-600">${myAmount.toFixed(0)}</div>
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
                className="w-full bg-[#E8733A] text-white py-4 rounded-xl font-semibold text-base hover:bg-[#C85E28] transition-colors mb-3">
                Chip in →
              </button>
            )}
            {/* WhatsApp share */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Hey! I'm collecting for ${pool.title} — a gift for ${pool.recipient}. Chip in here: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Share on WhatsApp
            </a>

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
                <div className="flex gap-2 mt-1 mb-2">
                  {[25, 50, 100, 200].map(preset => (
                    <button key={preset} type="button" onClick={() => setAmount(String(preset))}
                      className={`flex-1 py-1.5 rounded-lg text-sm font-semibold border transition-all ${amount === String(preset) ? 'border-[#E8733A] bg-orange-50 text-[#E8733A]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                      ${preset}
                    </button>
                  ))}
                </div>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E8733A]"
                  placeholder="or enter custom amount" min="1" />
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
