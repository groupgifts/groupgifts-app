import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceRoleClient } from '@/lib/supabase-server'
import { sendContributorReceipt, sendOrganiserNotification } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Required: tell Next.js not to parse the body so we can verify Stripe's signature
export const config = { api: { bodyParser: false } }

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ received: true })
    }

    const {
      pool_id,
      pool_slug,
      organiser_id,
      contributor_name,
      contributor_email,
      message,
      amount,
      show_amount,
      pool_title,
      recipient,
      goal,
    } = session.metadata!

    const amountNum = parseFloat(amount)
    const totalCharged = (session.amount_total ?? 0) / 100
    const stripeFee = parseFloat(((session.amount_total ?? 0) * 0.029 / 100 + 0.30).toFixed(2))
    const platformFee = parseFloat((amountNum * 0.05).toFixed(2))

    const db = createServiceRoleClient()
    console.log('Service role key prefix:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 15))

    // Insert the contribution
    const { error: insertError } = await db.from('contributions').insert({
      pool_id,
      contributor_name,
      contributor_email,
      message: message || null,
      show_amount: show_amount === 'true',
      amount: amountNum,
      total_charged: totalCharged,
      platform_fee: platformFee,
      stripe_fee: stripeFee,
      payment_intent_id: session.payment_intent as string,
      status: 'paid',
      paid_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error('Failed to insert contribution:', JSON.stringify(insertError))
      return NextResponse.json({ error: 'DB insert failed', detail: insertError.message, code: insertError.code }, { status: 500 })
    }

    // Get updated total for organiser notification
    const { data: contribs } = await db
      .from('contributions')
      .select('amount')
      .eq('pool_id', pool_id)
      .eq('status', 'paid')

    const totalRaised = (contribs ?? []).reduce((sum, c) => sum + c.amount, 0)

    // Send emails (don't fail the webhook if emails fail)
    await Promise.allSettled([
      sendContributorReceipt({
        to: contributor_email,
        contributorName: contributor_name,
        amount: amountNum,
        poolTitle: pool_title,
        recipient,
        slug: pool_slug,
      }),
      (async () => {
        // Look up organiser email via auth admin API
        const { data: { user: organiser } } = await db.auth.admin.getUserById(organiser_id)

        if (organiser?.email) {
          await sendOrganiserNotification({
            to: organiser.email,
            organiserName: organiser.user_metadata?.name ?? organiser.email,
            contributorName: contributor_name,
            amount: amountNum,
            poolTitle: pool_title,
            slug: pool_slug,
            totalRaised,
            goal: parseFloat(goal),
          })
        }
      })(),
    ])
  }

  return NextResponse.json({ received: true })
}
