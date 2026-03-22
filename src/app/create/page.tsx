'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUser } from '@/lib/auth'

const OCCASIONS = ['Birthday','Wedding','Baby Shower','Graduation','Anniversary','Retirement','Farewell','Celebration']

export default function CreatePool() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [recipient, setRecipient] = useState('')
  const [occasion, setOccasion] = useState('Birthday')
  const [date, setDate] = useState('')
  const [poolType, setPoolType] = useState<'split' | 'open'>('open')
  const [splitCount, setSplitCount] = useState('')
  const [goal, setGoal] = useState('')
  const [giftName, setGiftName] = useState('')
  const [giftUrl, setGiftUrl] = useState('')
  const [payoutType, setPayoutType] = useState<'organiser' | 'recipient' | 'charity'>('organiser')
  const [charityName, setCharityName] = useState('')

async function handleCreate() {
    setLoading(true)
    setError('')
    try {
      const user = await getUser()
      console.log('User:', user)
      if (!user) { router.push('/login'); return }

      const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()

      const { error } = await supabase.from('pools').insert({
        organiser_id: user.id,
        title,
        recipient,
        occasion,
        date: date || null,
        pool_type: poolType,
        split_count: poolType === 'split' ? parseInt(splitCount) : null,
        goal: parseFloat(goal),
        gift_name: giftName || null,
        gift_url: giftUrl || null,
        payout_type: payoutType,
        charity_name: payoutType === 'charity' ? charityName : null,
        slug,
        status: 'active',
      })

      if (error) throw error
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F3F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <h1 className="text-xl font-light italic" style={{fontFamily: 'Georgia, serif'}}>
          GroupGifts<span className="text-[#E8733A]">.me</span>
        </h1>
      </nav>

      <main className="max-w-lg mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl p-8 border border-gray-100">

          {/* Progress */}
          <div className="flex gap-2 mb-8">
            {[1,2,3].map(s => (
              <div key={s} className="h-1 flex-1 rounded-full" style={{background: s <= step ? '#E8733A' : '#E5E7EB'}} />
            ))}
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

          {/* Step 1 — Occasion */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-light italic mb-1" style={{fontFamily: 'Georgia, serif'}}>The occasion</h2>
              <p className="text-gray-400 text-sm mb-6">Who are we surprising?</p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pool name</label>
                  <input value={title} onChange={e => setTitle(e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E8733A]"
                    placeholder="e.g. Fernanda's Birthday 🎂" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recipient</label>
                  <input value={recipient} onChange={e => setRecipient(e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E8733A]"
                    placeholder="Who's the gift for?" />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Occasion</label>
                    <select value={occasion} onChange={e => setOccasion(e.target.value)}
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E8733A]">
                      {OCCASIONS.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E8733A]" />
                  </div>
                </div>
              </div>

              <button onClick={() => setStep(2)} disabled={!title || !recipient}
                className="w-full mt-6 bg-[#E8733A] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#C85E28] transition-colors disabled:opacity-50">
                Continue →
              </button>
            </div>
          )}

          {/* Step 2 — Goal */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-light italic mb-1" style={{fontFamily: 'Georgia, serif'}}>The gift & goal</h2>
              <p className="text-gray-400 text-sm mb-6">How will people contribute?</p>

              <div className="flex flex-col gap-4">
                <div className="flex gap-3">
                  {(['open', 'split'] as const).map(t => (
                    <div key={t} onClick={() => setPoolType(t)}
                      className={`flex-1 p-3 rounded-xl border-2 cursor-pointer text-center text-sm font-semibold transition-all ${poolType === t ? 'border-[#E8733A] bg-orange-50 text-[#E8733A]' : 'border-gray-200 text-gray-500'}`}>
                      {t === 'open' ? '🎁 Open contributions' : '🎯 Split evenly'}
                    </div>
                  ))}
                </div>

                {poolType === 'split' && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Number of people splitting</label>
                    <input type="number" value={splitCount} onChange={e => setSplitCount(e.target.value)}
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E8733A]"
                      placeholder="e.g. 8" />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Goal amount (USD)</label>
                  <input type="number" value={goal} onChange={e => setGoal(e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E8733A]"
                    placeholder="e.g. 500" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gift name (optional)</label>
                  <input value={giftName} onChange={e => setGiftName(e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E8733A]"
                    placeholder="e.g. Hermès Earrings" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Product URL (optional)</label>
                  <input value={giftUrl} onChange={e => setGiftUrl(e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E8733A]"
                    placeholder="https://..." />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-500 py-3 rounded-xl font-semibold text-sm">← Back</button>
                <button onClick={() => setStep(3)} disabled={!goal}
                  className="flex-1 bg-[#E8733A] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#C85E28] transition-colors disabled:opacity-50">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Payout */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-light italic mb-1" style={{fontFamily: 'Georgia, serif'}}>When goal is reached…</h2>
              <p className="text-gray-400 text-sm mb-6">What happens with the funds?</p>

              <div className="flex flex-col gap-3">
                {[
                  { value: 'organiser', icon: '🛍️', title: "I'll buy the gift myself", sub: 'Funds transfer to you — surprise stays intact' },
                  { value: 'recipient', icon: '💳', title: 'Transfer to recipient', sub: 'They get notified — not for surprises' },
                  { value: 'charity', icon: '🤝', title: 'Donate to charity', sub: 'Full amount to a cause they love' },
                ].map(opt => (
                  <div key={opt.value} onClick={() => setPayoutType(opt.value as any)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${payoutType === opt.value ? 'border-[#E8733A] bg-orange-50' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{opt.icon}</span>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{opt.title}</div>
                        <div className="text-xs text-gray-400">{opt.sub}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {payoutType === 'charity' && (
                  <input value={charityName} onChange={e => setCharityName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E8733A]"
                    placeholder="Charity name e.g. UNICEF" />
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 text-gray-500 py-3 rounded-xl font-semibold text-sm">← Back</button>
                <button onClick={handleCreate} disabled={loading}
                  className="flex-1 bg-[#E8733A] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#C85E28] transition-colors disabled:opacity-50">
                  {loading ? 'Creating...' : '🎉 Create Pool'}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}