import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'
import { createServiceRoleClient } from '@/lib/supabase-server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { slug, name, email, amount, message, showMyAmount } = await req.json()

    if (!slug || !name || !email || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum < 1) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Fetch pool to get title, recipient, organiser_id
    const { data: pool, error: poolError } = await supabase
      .from('pools')
      .select('id, title, recipient, goal, organiser_id')
      .eq('slug', slug)
      .eq('status', 'active')
      .single()

    if (poolError || !pool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 })
    }

    // Fetch organiser's connected Stripe account
    const db = createServiceRoleClient()
    const { data: organiser } = await db
      .from('organisers')
      .select('stripe_account_id, stripe_onboarding_complete')
      .eq('id', pool.organiser_id)
      .single()

    if (!organiser?.stripe_account_id || !organiser?.stripe_onboarding_complete) {
      return NextResponse.json({ error: 'This pool is not ready to accept payments yet. The organiser needs to connect their bank account.' }, { status: 400 })
    }

    // Calculate fees so contributor covers everything
    // Platform fee: 5% of contribution
    // Stripe fee: 2.9% of total + $0.30 — gross up so net = contribution + platform fee
    const platformFee = Math.round(amountNum * 0.05 * 100) / 100
    const grossTotal = Math.ceil(((amountNum + platformFee + 0.30) / (1 - 0.029)) * 100) / 100
    const serviceFee = Math.round((grossTotal - amountNum) * 100) / 100

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Contribution to ${pool.title}`,
              description: `Group gift for ${pool.recipient}`,
            },
            unit_amount: Math.round(amountNum * 100),
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Service fee',
              description: '5% platform fee + payment processing',
            },
            unit_amount: Math.round(serviceFee * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      payment_intent_data: {
        application_fee_amount: Math.round(serviceFee * 100),
        transfer_data: {
          destination: organiser.stripe_account_id,
        },
      },
      metadata: {
        pool_id: pool.id,
        pool_slug: slug,
        organiser_id: pool.organiser_id,
        contributor_name: name,
        contributor_email: email,
        message: message || '',
        amount: amountNum.toString(),
        show_amount: showMyAmount ? 'true' : 'false',
        pool_title: pool.title,
        recipient: pool.recipient,
        goal: pool.goal.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/contribute/${slug}?success=1&amount=${amountNum}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/contribute/${slug}`,
    })

    return NextResponse.json({ url: session.url, serviceFee })
  } catch (err: any) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
