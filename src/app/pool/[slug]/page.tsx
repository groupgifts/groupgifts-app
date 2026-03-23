'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getUser } from '@/lib/auth'

export default function PoolDetail() {
  const { slug } = useParams()
  const router = useRouter()
  const [pool, setPool] = useState<any>(null)
  const [contributions, setContributions] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadPool()
  }, [slug])

  async function loadPool() {
    const u = await getUser()
    setUser(u)

    const { data: poolData } = await supabase
      .from('pools')
      .select('*')
      .eq('slug', slug)
      .single()

    if (!poolData) { router.push('/dashboard'); return }
    setPool(poolData)

    const { data: contribs } = await supabase
      .from('contributions')
      .select('*')
      .eq('pool_id', poolData.id)
      .eq('status', 'paid')
      .order('created_at', { ascending: false })

    setContributions(contribs || [])
    setLoading(false)
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
        <h1 className="text-xl font-light italic" style={{fontFamily: 'Georgia, serif'}}>
          GroupGifts<span className="text-[#E8733A]">.me</span>
        </h1>
        <div className="w-16" />
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">

        {/* Hero card */}
        <div className={`rounded-2xl p-6 mb-6 ${done ? 'bg-green-50 border border-green-100' : 'bg-white border border-gray-100'}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-semibold text-[#E8733A] uppercase tracking-wide">{pool.occasion}</span>
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
                </div>
                <div className="text-lg font-bold text-[#18B894]">+${c.amount.toFixed(0)}</div>
              </div>
            ))}
          </div>
        )}
{/* Close pool button */}
        {!done && user && pool.organiser_id === user.id && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="text-sm font-semibold text-gray-900 mb-1">Ready to close this pool?</div>
              <div className="text-xs text-gray-400 mb-4">Once closed, no new contributions can be added. You'll receive the funds within 2 business days.</div>
              <button
                onClick={async () => {
                  if (!confirm('Are you sure you want to close this pool?')) return
                  await supabase.from('pools').update({ status: 'paid_out', closed_at: new Date().toISOString() }).eq('id', pool.id)
                  setPool({ ...pool, status: 'paid_out' })
                }}
                className="w-full bg-[#0D0D0D] text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
                Close pool & request payout →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}