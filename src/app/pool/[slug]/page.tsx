'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getUser } from '@/lib/auth'
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

export default function PoolDetail() {
  const { slug } = useParams()
  const router = useRouter()
  const [pool, setPool] = useState<any>(null)
  const [contributions, setContributions] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [refunding, setRefunding] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [editGoal, setEditGoal] = useState('')
  const [editPoolType, setEditPoolType] = useState<'open' | 'split'>('open')
  const [editSplitCount, setEditSplitCount] = useState('')
  const [editGiftName, setEditGiftName] = useState('')
  const [editGiftUrl, setEditGiftUrl] = useState('')
  const [editHideTotal, setEditHideTotal] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPool()
  }, [slug])

  async function loadPool() {
    const u = await getUser()
    setUser(u)
    const { data: { session } } = await supabase.auth.getSession()
    setAccessToken(session?.access_token ?? null)

    const { data: poolData } = await supabase
      .from('pools')
      .select('*')
      .eq('slug', slug)
      .single()

    if (!poolData) { router.push('/dashboard'); return }
    setPool(poolData)
    setEditGoal(String(poolData.goal))
    setEditPoolType(poolData.pool_type || 'open')
    setEditSplitCount(String(poolData.split_count || ''))
    setEditGiftName(poolData.gift_name || '')
    setEditGiftUrl(poolData.gift_url || '')
    setEditHideTotal(poolData.hide_total || false)

    const { data: contribs } = await supabase
      .from('contributions')
      .select('*')
      .eq('pool_id', poolData.id)
      .eq('status', 'paid')
      .order('created_at', { ascending: false })

    setContributions(contribs || [])
    setLoading(false)
  }

  async function saveEdit() {
    setSaving(true)
    const { error } = await supabase.from('pools')
      .update({
        goal: parseFloat(editGoal),
        pool_type: editPoolType,
        split_count: editPoolType === 'split' ? parseInt(editSplitCount) : null,
        gift_name: editGiftName || null,
        gift_url: editGiftUrl || null,
        hide_total: editHideTotal,
      })
      .eq('id', pool.id)
      .eq('organiser_id', user.id)
    if (!error) {
      setPool({
        ...pool,
        goal: parseFloat(editGoal),
        pool_type: editPoolType,
        split_count: editPoolType === 'split' ? parseInt(editSplitCount) : null,
        gift_name: editGiftName || null,
        gift_url: editGiftUrl || null,
        hide_total: editHideTotal,
      })
      setEditing(false)
    }
    setSaving(false)
  }

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/contribute/${pool.slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F4F3F0] flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  )

  const raised = contributions.reduce((sum, c) => sum + c.amount, 0)
  const pct = Math.min(100, pool.goal > 0 ? Math.round((raised / pool.goal) * 100) : 0)
  const done = pct >= 100

  return (
    <div className="min-h-screen bg-[#F4F3F0]">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">← Back</Link>
        <Logo />
        <div className="w-16" />
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">

        {/* Hero card */}
        <div className={`rounded-2xl p-6 mb-6 ${done ? 'bg-green-50 border border-green-100' : 'bg-white border border-gray-100'}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-semibold text-[#E8733A] uppercase tracking-wide">{OCCASION_EMOJI[pool.occasion] || '🎁'} {pool.occasion}</span>
                {pool.gift_intent === 'charity' && (
                  <span className="text-xs font-semibold bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">🤝 Charity donation</span>
                )}
                {pool.gift_intent === 'open' && (
                  <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">💰 No specific gift yet</span>
                )}
                {(pool.gift_intent === 'specific' || !pool.gift_intent) && (
                  <span className="text-xs font-semibold bg-orange-50 text-[#E8733A] px-2 py-0.5 rounded-full">🎁 Specific gift</span>
                )}
              </div>
              <h2 className="text-3xl font-light italic mt-1" style={{fontFamily: 'Georgia, serif'}}>{pool.title}</h2>
              <p className="text-gray-400 text-sm mt-1">For {pool.recipient}{pool.date ? ` · ${pool.date}` : ''}</p>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${done ? 'bg-green-100 text-green-700' : 'bg-orange-50 text-[#E8733A]'}`}>
              {done ? '🎉 Complete' : 'Active'}
            </span>
          </div>

          <div className="text-4xl font-bold mb-1" style={{color: done ? '#18B894' : '#0D0D0D'}}>
            ${raised.toFixed(0)}
          </div>
          <div className="text-sm text-gray-400 mb-4">of ${pool.goal.toFixed(0)} goal</div>

          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div className="h-full rounded-full transition-all" style={{width: `${pct}%`, background: done ? '#18B894' : '#E8733A'}} />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{pct}% funded · {contributions.length} contributor{contributions.length !== 1 ? 's' : ''}</span>
            <span className="text-gray-400">${Math.max(0, pool.goal - raised).toFixed(0)} to go</span>
          </div>
        </div>

        {/* Gift info */}
        {pool.gift_name && (
          <div className="bg-white rounded-2xl p-5 mb-6 border border-gray-100">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Target Gift</div>
            <div className="font-semibold text-gray-900">{pool.gift_name}</div>
            {pool.gift_url && (
              <a href={pool.gift_url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-[#E8733A] font-medium mt-1 inline-block">View product ↗</a>
            )}
          </div>
        )}

        {/* Edit settings — organiser only */}
        {user && pool.organiser_id === user.id && pool.status === 'active' && (
          <div className="bg-white rounded-2xl p-5 mb-6 border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Pool settings</div>
              {!editing && (
                <button onClick={() => setEditing(true)} className="text-xs text-[#E8733A] font-semibold hover:underline">Edit</button>
              )}
            </div>
            {editing ? (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Contribution type</label>
                  <div className="flex gap-2">
                    {(['open', 'split'] as const).map(t => (
                      <div key={t} onClick={() => setEditPoolType(t)}
                        className={`flex-1 p-3 rounded-xl border-2 cursor-pointer text-center text-sm font-semibold transition-all ${editPoolType === t ? 'border-[#E8733A] bg-orange-50 text-[#E8733A]' : 'border-gray-200 text-gray-500'}`}>
                        {t === 'open' ? '🎁 Open contributions' : '🎯 Split evenly'}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Goal amount (USD)</label>
                  <input type="number" value={editGoal} onChange={e => setEditGoal(e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E8733A]" />
                </div>
                {editPoolType === 'split' && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Number of people splitting</label>
                    <input type="number" value={editSplitCount} onChange={e => setEditSplitCount(e.target.value)}
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E8733A]" />
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gift name (optional)</label>
                  <input value={editGiftName} onChange={e => setEditGiftName(e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E8733A]"
                    placeholder="e.g. Hermès Earrings" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Product URL (optional)</label>
                  <input value={editGiftUrl} onChange={e => setEditGiftUrl(e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E8733A]"
                    placeholder="https://..." />
                </div>
                <label className="flex items-center justify-between cursor-pointer pt-1">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Hide total from contributors</div>
                    <div className="text-xs text-gray-400">Contributors won't see the progress bar or total raised</div>
                  </div>
                  <div onClick={() => setEditHideTotal(!editHideTotal)}
                    className={`relative w-10 h-6 rounded-full transition-colors ${editHideTotal ? 'bg-[#E8733A]' : 'bg-gray-200'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${editHideTotal ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                </label>
                <div className="flex gap-2 mt-1">
                  <button onClick={saveEdit} disabled={saving || !editGoal}
                    className="flex-1 bg-[#E8733A] text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                  <button onClick={() => { setEditing(false); setEditGoal(String(pool.goal)); setEditPoolType(pool.pool_type || 'open'); setEditSplitCount(String(pool.split_count || '')); setEditGiftName(pool.gift_name || ''); setEditGiftUrl(pool.gift_url || '') }}
                    className="px-4 py-2 border border-gray-200 text-gray-500 rounded-lg text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600 flex flex-col gap-1">
                <div>
                  <span className="font-semibold">{pool.pool_type === 'split' ? '🎯 Split evenly' : '🎁 Open contributions'}</span>
                  <span className="mx-2 text-gray-300">·</span>
                  Goal: <span className="font-semibold">${pool.goal.toFixed(0)}</span>
                  {pool.pool_type === 'split' && pool.split_count && (
                    <span className="ml-2 text-gray-400">· {pool.split_count} people · ${(pool.goal / pool.split_count).toFixed(0)} each</span>
                  )}
                </div>
                {pool.gift_name && (
                  <div>Gift: <span className="font-semibold">{pool.gift_name}</span>
                    {pool.gift_url && <a href={pool.gift_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-[#E8733A] text-xs font-medium">View ↗</a>}
                  </div>
                )}
                {pool.hide_total && (
                  <div className="text-xs text-gray-400">🙈 Total hidden from contributors</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Share link */}
        <div className="bg-white rounded-2xl p-5 mb-6 border border-gray-100">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Share with contributors</div>
          <div className="flex gap-3">
            <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500 truncate">
              {typeof window !== 'undefined' ? `${window.location.origin}/contribute/${pool.slug}` : `app.groupgifts.me/contribute/${pool.slug}`}
            </div>
            <button onClick={copyLink}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${copied ? 'bg-green-500 text-white' : 'bg-[#E8733A] text-white hover:bg-[#C85E28]'}`}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">🤫 The recipient never sees this pool</p>
        </div>

        {/* Contributions */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-900">Contributions</h3>
          <span className="text-sm text-gray-400">{contributions.length} total</span>
        </div>

        {contributions.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
            <div className="text-3xl mb-3">💛</div>
            <p className="text-gray-400 text-sm">Share the link to start collecting contributions!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {contributions.map(c => (
              <div key={c.id} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{background: '#E8733A'}}>
                  {c.contributor_name[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-gray-900">{c.contributor_name}</div>
                  {c.message && <div className="text-xs text-gray-400 mt-0.5">"{c.message}"</div>}
                  {!c.show_amount && <div className="text-xs text-gray-300 mt-0.5">Amount hidden from public</div>}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold text-[#18B894]">+${c.amount.toFixed(0)}</div>
                  {user && pool.organiser_id === user.id && (
                    <button
                      disabled={refunding === c.id}
                      onClick={async () => {
                        if (!confirm(`Refund $${c.amount.toFixed(0)} to ${c.contributor_name}? This cannot be undone.`)) return
                        setRefunding(c.id)
                        const res = await fetch('/api/refund', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
                          body: JSON.stringify({ contribution_id: c.id }),
                        })
                        if (res.ok) {
                          setContributions(prev => prev.filter(x => x.id !== c.id))
                        } else {
                          const d = await res.json()
                          alert('Refund failed: ' + d.error)
                        }
                        setRefunding(null)
                      }}
                      className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors disabled:opacity-40">
                      {refunding === c.id ? 'Refunding...' : 'Refund'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
{/* Close pool button */}
        {!done && user && pool.organiser_id === user.id && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="text-sm font-semibold text-gray-900 mb-1">Ready to close this pool?</div>
              <div className="text-xs text-gray-400 mb-4">
                Once closed, no new contributions can be added. You'll receive the funds within 2 business days.
                {pool.recipient_email && ' The recipient will be emailed their digital card.'}
              </div>
              <button
                onClick={async () => {
                  if (!confirm('Are you sure you want to close this pool?')) return
                  await fetch('/api/close-pool', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
                    body: JSON.stringify({ pool_id: pool.id }),
                  })
                  setPool({ ...pool, status: 'paid_out' })
                }}
                className="w-full bg-[#0D0D0D] text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
                Close pool & request payout →
              </button>
            </div>
          </div>
        )}

        {/* Delete pool — organiser only */}
        {user && pool.organiser_id === user.id && (
          <div className="mt-4 text-center">
            <button
              onClick={async () => {
                if (!confirm('Delete this pool permanently? All contributions will be refunded first. This cannot be undone.')) return
                const res = await fetch('/api/delete-pool', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
                  body: JSON.stringify({ pool_id: pool.id }),
                })
                if (res.ok) {
                  router.push('/dashboard')
                } else {
                  const d = await res.json()
                  alert('Delete failed: ' + d.error)
                }
              }}
              className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors">
              Delete pool
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
