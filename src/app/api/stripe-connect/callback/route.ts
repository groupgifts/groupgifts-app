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

    const { data: organiser } = await db
      .from('organisers')
      .select('stripe_account_id')
      .eq('id', user.id)
      .single()

    if (!organiser?.stripe_account_id) {
      return NextResponse.json({ complete: false })
    }

    const account = await stripe.accounts.retrieve(organiser.stripe_account_id)
    const complete = account.details_submitted && !!account.payouts_enabled

    if (complete) {
      await db.from('organisers')
        .update({ stripe_onboarding_complete: true })
        .eq('id', user.id)
    }

    return NextResponse.json({ complete, payouts_enabled: account.payouts_enabled })
  } catch (err: any) {
    console.error('Stripe Connect callback error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
