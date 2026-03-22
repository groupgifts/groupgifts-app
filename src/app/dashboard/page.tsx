'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { signOut } from '@/lib/auth'

export default function Dashboard() {
  const router = useRouter()
  const [pools, setPools] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase
        .from('pools')
        .select('*, contributions(amount, status)')
        .eq('organiser_id', user.id)
        .order('created_at', { ascending: false })
      setPools(data || [])
      setLoading(false)
    }
    init()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const getRaised = (pool: any) =>
    (pool.contributions || [])
      .filter((c: any) => c.status === 'paid')
      .reduce((sum: number, c: any) => sum + c.amount, 0)

  if (loading) return (
    <main className="min-h-screen bg-[#F4F3F0] flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-[#F4F3F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-light italic" style={{fontFamily: 'Georgia, serif'}}>
          GroupGifts<span className="text-[#E8733A]">.me</span>
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{user?.email}</span>
          <button onClick={handleSignOut} className="text-sm text-gray-400 hover:text-gray-600">Sign out</button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-light italic" style={{fontFamily: 'Georgia, serif'}}>Your pools</h2>
            <p className="text-gray-400 text-sm mt-1">{pools.length} pool{pools.length !== 1 ? 's' : ''}</p>
          </div>
          <Link href="/create" className="bg-[#E8733A] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#C85E28] transition-colors">
            + New Pool
          </Link>
        </div>

        {pools.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No pools yet</h3>
            <p className="text-gray-400 text-sm mb-6">Create your first surprise gift pool.</p>
            <Link href="/create" className="bg-[#E8733A] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#C85E28] transition-colors">
              Create a pool →
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {pools.map(pool => {
            const raised = getRaised(pool)
            const pct = pool.goal > 0 ? Math.min(100, Math.round((raised / pool.goal) * 100)) : 0
            const done = pct >= 100
            return (
<Link href={`/pool/${pool.slug}`} key={pool.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{pool.title}</h3>
                    <p className="text-sm text-gray-400 mt-0.5">For {pool.recipient} · {pool.occasion}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${done ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-[#E8733A]'}`}>
                    {done ? '🎉 Complete' : `${pct}%`}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div className="h-full rounded-full transition-all" style={{width: `${pct}%`, background: done ? '#18B894' : '#E8733A'}} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{(pool.contributions || []).filter((c:any) => c.status === 'paid').length} contributors</span>
                  <span className="font-semibold text-gray-900">${raised.toFixed(0)} <span className="font-normal text-gray-400">/ ${pool.goal}</span></span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
