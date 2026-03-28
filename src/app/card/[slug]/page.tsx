'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function DigitalCard() {
  const { slug } = useParams()
  const [pool, setPool] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [totalRaised, setTotalRaised] = useState(0)
  const [totalContributors, setTotalContributors] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadCard() }, [slug])

  async function loadCard() {
    const { data: poolData } = await supabase
      .from('pools')
      .select('*')
      .eq('slug', slug)
      .single()

    if (!poolData) { setLoading(false); return }
    setPool(poolData)

    const { data: contribs } = await supabase
      .from('contributions')
      .select('contributor_name, message, amount')
      .eq('pool_id', poolData.id)
      .eq('status', 'paid')
      .order('created_at', { ascending: false })

    const all = contribs || []
    setTotalRaised(all.reduce((sum, c) => sum + c.amount, 0))
    setTotalContributors(all.length)
    setMessages(all.filter(c => c.message))
    setLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F4]">
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  )

  if (!pool) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F4]">
      <div className="text-gray-400 text-sm">Card not found.</div>
    </div>
  )

  const colors = ['#E8733A', '#18B894', '#9B59B6', '#E74C8B', '#3498DB', '#F39C12']

  return (
    <div className="min-h-screen bg-[#FDF8F4] py-12 px-6">
      {/* Decorative orbs */}
      <div style={{
        position: 'fixed', top: -80, right: -80, width: 320, height: 320,
        borderRadius: '50%', background: 'rgba(232,115,58,0.10)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: -60, left: -60, width: 280, height: 280,
        borderRadius: '50%', background: 'rgba(24,184,148,0.10)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      <div className="max-w-lg mx-auto relative">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-gray-400 text-xs font-medium">
            <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-xs" style={{background: '#E8733A'}}>🎁</div>
            GroupGifts.me
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-5">🎁</div>
          <h1 className="text-4xl font-light italic text-gray-900 mb-3 leading-tight" style={{fontFamily: 'Georgia, serif'}}>
            {pool.title}
          </h1>
          <p className="text-gray-400 text-base mb-6">
            For <span className="text-gray-700 font-medium">{pool.recipient}</span> · with love from {totalContributors} {totalContributors === 1 ? 'person' : 'people'}
          </p>

          {/* Amount raised */}
          <div className="inline-flex flex-col items-center bg-white rounded-2xl px-8 py-5 border border-gray-100 shadow-sm">
            <div className="text-4xl font-bold text-[#E8733A] mb-1">${totalRaised.toFixed(0)}</div>
            <div className="text-sm text-gray-400">raised together</div>
          </div>
        </div>

        {/* Gift info */}
        {pool.gift_name && (
          <div className="bg-white rounded-2xl p-5 mb-6 border border-gray-100 text-center">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">The gift</div>
            <div className="text-lg font-semibold text-gray-900">{pool.gift_name}</div>
            {pool.gift_url && (
              <a href={pool.gift_url} target="_blank" rel="noopener noreferrer"
                className="inline-block mt-2 text-sm text-[#E8733A] font-medium hover:underline">
                View it ↗
              </a>
            )}
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
              Messages from the group
            </h2>
            <div className="flex flex-col gap-4">
              {messages.map((c, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100">
                  <p className="text-gray-700 text-sm italic leading-relaxed mb-4">
                    "{c.message}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                      style={{background: colors[i % colors.length]}}>
                      {c.contributor_name[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-500">{c.contributor_name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {messages.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 mb-8">
            <div className="text-3xl mb-3">💛</div>
            <p className="text-gray-400 text-sm">Your friends are thinking of you.</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-300 text-xs">Made with <span style={{color: '#E8733A'}}>GroupGifts.me</span></p>
        </div>

      </div>
    </div>
  )
}
