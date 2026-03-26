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
    <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #1A1A2E, #2D1B4E)'}}>
      <div className="text-white text-sm opacity-50">Loading...</div>
    </div>
  )

  if (!pool) return (
    <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #1A1A2E, #2D1B4E)'}}>
      <div className="text-white text-sm opacity-50">Card not found.</div>
    </div>
  )

  return (
    <div className="min-h-screen py-12 px-6" style={{background: 'linear-gradient(135deg, #1A1A2E, #2D1B4E)'}}>
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-4">🎁</div>
          <h1 className="text-3xl font-light italic text-white mb-2" style={{fontFamily: 'Georgia, serif'}}>
            {pool.title}
          </h1>
          <p className="text-white opacity-50 text-sm">
            For {pool.recipient} · From {totalContributors} people who love you
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white bg-opacity-10 rounded-full px-4 py-2">
            <span className="text-white font-semibold">${totalRaised.toFixed(0)}</span>
            <span className="text-white opacity-50 text-sm">raised together</span>
          </div>
        </div>

        {/* Messages */}
        {messages.length === 0 ? (
          <div className="text-center text-white opacity-40 text-sm">No messages yet.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((c, i) => (
              <div key={i} className="rounded-2xl p-5" style={{background: 'rgba(255,255,255,0.07)'}}>
                <p className="text-white opacity-80 text-sm italic leading-relaxed mb-3">
                  "{c.message}"
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                    style={{background: '#E8733A'}}>
                    {c.contributor_name[0].toUpperCase()}
                  </div>
                  <span className="text-white opacity-50 text-xs">— {c.contributor_name}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-10">
          <p className="text-white opacity-30 text-xs">Made with GroupGifts.me</p>
        </div>

      </div>
    </div>
  )
}