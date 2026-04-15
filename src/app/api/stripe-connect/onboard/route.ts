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

    // Get or create Stripe Connect account
    const { data: organiser } = await db
      .from('organisers')
      .select('stripe_account_id, email, name')
      .eq('id', user.id)
      .single()

    let stripeAccountId = organiser?.stripe_account_id

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: organiser?.email || user.email,
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
      })
      stripeAccountId = account.id

      await db.from('organisers')
        .update({ stripe_account_id: stripeAccountId })
        .eq('id', user.id)
    }

    // Generate onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/connect?refresh=1`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/connect/return`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (err: any) {
    console.error('Stripe Connect onboard error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
