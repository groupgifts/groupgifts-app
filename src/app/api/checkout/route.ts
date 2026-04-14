import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

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

    const session = await stripe.checkout.sessions.create({
      automatic_payment_methods: { enabled: true },
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
      ],
      mode: 'payment',
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

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
