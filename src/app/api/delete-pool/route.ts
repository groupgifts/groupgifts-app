import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceRoleClient } from '@/lib/supabase-server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { pool_id, organiser_id } = await req.json()
    if (!pool_id || !organiser_id) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const db = createServiceRoleClient()

    // Verify organiser owns this pool
    const { data: pool } = await db
      .from('pools')
      .select('id')
      .eq('id', pool_id)
      .eq('organiser_id', organiser_id)
      .single()

    if (!pool) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Refund all paid contributions
    const { data: contribs } = await db
      .from('contributions')
      .select('id, payment_intent_id')
      .eq('pool_id', pool_id)
      .eq('status', 'paid')

    for (const c of contribs || []) {
      if (c.payment_intent_id) {
        await stripe.refunds.create({ payment_intent: c.payment_intent_id }).catch(() => {})
      }
      await db.from('contributions').update({ status: 'refunded' }).eq('id', c.id)
    }

    // Delete contributions then pool
    await db.from('contributions').delete().eq('pool_id', pool_id)
    await db.from('pools').delete().eq('id', pool_id)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Delete pool error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
