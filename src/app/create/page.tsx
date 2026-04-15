'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUser } from '@/lib/auth'
import Logo from '@/components/Logo'

const OCCASIONS = [
  { value: 'Birthday',    emoji: '🎂' },
  { value: 'Wedding',     emoji: '💍' },
  { value: 'Baby Shower', emoji: '🍼' },
  { value: 'Graduation',  emoji: '🎓' },
  { value: 'Anniversary', emoji: '💝' },
  { value: 'Retirement',  emoji: '🥂' },
  { value: 'Farewell',    emoji: '✈️' },
  { value: 'Celebration', emoji: '🎉' },
]

export default function CreatePool() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [recipient, setRecipient] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [occasion, setOccasion] = useState('Birthday')
  const [date, setDate] = useState('')
  const [poolType, setPoolType] = useState<'split' | 'open'>('open')
  const [splitCount, setSplitCount] = useState('')
  const [goal, setGoal] = useState('')
  const [giftIntent, setGiftIntent] = useState<'specific' | 'open' | 'charity'>('specific')
  const [giftName, setGiftName] = useState('')
  const [giftUrl, setGiftUrl] = useState('')
  const [showAmountsPublicly, setShowAmountsPublicly] = useState(false)
  const [showMessagesOnCard, setShowMessagesOnCard] = useState(true)

  async function handleCreate() {
    setLoading(true)
    setError('')
    try {
      const user = await getUser()
      if (!user) { router.push('/login'); return }

      const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()

      const { error } = await supabase.from('pools').insert({
        organiser_id: user.id,
        title,
        recipient,
        recipient_email: recipientEmail || null,
        occasion,
        date: date || null,
        pool_type: poolType,
        split_count: poolType === 'split' ? parseInt(splitCount) : null,
        goal: parseFloat(goal),
        gift_intent: giftIntent,
        gift_name: giftName || null,
        gift_url: giftUrl || null,
        payout_type: 'organiser',
        show_amounts_publicly: showAmountsPublicly,
        show_messages_on_card: showMessagesOnCard,
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
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-center">
        <Logo />
      </nav>

      <main className="max-w-lg mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl p-8 border border-gray-100">

          {/* Progress — 2 steps */}
          <div className="flex gap-2 mb-8">
            {[1, 2].map(s => (
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
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recipient name</label>
                  <input value={recipient} onChange={e => setRecipient(e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E8733A]"
                    placeholder="Who's the gift for?" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Recipient email <span className="text-gray-300 normal-case font-normal">(optional — to send them the card)</span>
                  </label>
                  <input type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E8733A]"
                    placeholder="recipient@email.com" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Occasion</label>
                  <div className="grid grid-cols-4 gap-2">
                    {OCCASIONS.map(o => (
                      <div key={o.value} onClick={() => {
                        const oldEmoji = OCCASIONS.find(x => x.value === occasion)?.emoji || ''
                        setOccasion(o.value)
                        setTitle(prev => {
                          // Strip any existing occasion emoji from end
                          let t = prev.trimEnd()
                          if (oldEmoji && t.endsWith(oldEmoji)) t = t.slice(0, -oldEmoji.length).trimEnd()
                          // Also strip new emoji if already there (re-click same occasion)
                          if (t.endsWith(o.emoji)) t = t.slice(0, -o.emoji.length).trimEnd()
                          return t ? `${t} ${o.emoji}` : o.emoji
                        })
                      }}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 cursor-pointer transition-all ${occasion === o.value ? 'border-[#E8733A] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <span className="text-2xl">{o.emoji}</span>
                        <span className={`text-xs font-medium text-center leading-tight ${occasion === o.value ? 'text-[#E8733A]' : 'text-gray-500'}`}>{o.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E8733A]" />
                </div>
              </div>

              <button onClick={() => setStep(2)} disabled={!title || !recipient}
                className="w-full mt-6 bg-[#E8733A] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#C85E28] transition-colors disabled:opacity-50">
                Continue →
              </button>
            </div>
          )}

          {/* Step 2 — Gift, goal & settings */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-light italic mb-1" style={{fontFamily: 'Georgia, serif'}}>The gift & goal</h2>
              <p className="text-gray-400 text-sm mb-6">How will people contribute?</p>

              <div className="flex flex-col gap-4">
                {/* Gift intent */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">What's the plan for the gift?</label>
                  <div className="flex flex-col gap-2">
                    {([
                      { value: 'specific', icon: '🎁', label: 'I have a gift in mind', desc: 'You know what you want to buy — add a name or link below' },
                      { value: 'open',     icon: '💰', label: "No specific gift yet",  desc: "You'll decide once the pool closes" },
                      { value: 'charity',  icon: '🤝', label: 'Charity donation',      desc: "The funds will be donated to a cause they love" },
                    ] as const).map(opt => (
                      <div key={opt.value} onClick={() => setGiftIntent(opt.value)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${giftIntent === opt.value ? 'border-[#E8733A] bg-orange-50' : 'border-gray-200'}`}>
                        <div className={`text-sm font-semibold ${giftIntent === opt.value ? 'text-[#E8733A]' : 'text-gray-700'}`}>{opt.icon} {opt.label}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{opt.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

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

                {giftIntent === 'specific' && (
                  <>
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
                  </>
                )}
              </div>

              {/* Privacy */}
              <div className="mt-6 border-t border-gray-100 pt-5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Privacy</h3>
                <div className="flex flex-col gap-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={showAmountsPublicly} onChange={e => setShowAmountsPublicly(e.target.checked)}
                      className="mt-0.5 rounded accent-[#E8733A]" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Show contribution amounts publicly</div>
                      <div className="text-xs text-gray-400">Contributors can see each other's amounts on the pool page</div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={showMessagesOnCard} onChange={e => setShowMessagesOnCard(e.target.checked)}
                      className="mt-0.5 rounded accent-[#E8733A]" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Show messages on digital card</div>
                      <div className="text-xs text-gray-400">Messages from contributors appear on the recipient's card</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Payout notice */}
              <div className="mt-5 bg-orange-50 rounded-xl p-4 flex gap-3">
                <span className="text-lg flex-shrink-0">💳</span>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Funds are paid out to you</div>
                  <div className="text-xs text-gray-500 mt-0.5">When you close the pool, the collected amount is transferred to your account within 2 business days. You buy the gift — the surprise stays intact.</div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-500 py-3 rounded-xl font-semibold text-sm">← Back</button>
                <button onClick={handleCreate} disabled={loading || !goal}
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
