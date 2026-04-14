import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceRoleClient } from '@/lib/supabase-server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = createServiceRoleClient()

    const { data: { user }, error: authError } = await db.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { contribution_id } = await req.json()
    if (!contribution_id) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    // Fetch contribution + verify organiser owns the pool
    const { data: contribution } = await db
      .from('contributions')
      .select('*, pools(organiser_id, title)')
      .eq('id', contribution_id)
      .eq('status', 'paid')
      .single()

    if (!contribution) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 })
    }

    if (contribution.pools.organiser_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Issue Stripe refund
    await stripe.refunds.create({
      payment_intent: contribution.payment_intent_id,
    })

    // Mark as refunded
    await db.from('contributions')
      .update({ status: 'refunded' })
      .eq('id', contribution_id)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Refund error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
