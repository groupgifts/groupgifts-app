import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase-server'
import { sendRecipientCard } from '@/lib/email'

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
      .select('*')
      .eq('id', pool_id)
      .eq('organiser_id', organiser_id)
      .single()

    if (!pool) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Close the pool
    await db.from('pools').update({
      status: 'paid_out',
      closed_at: new Date().toISOString(),
    }).eq('id', pool_id)

    // Send card to recipient if email is set
    if (pool.recipient_email) {
      const { data: contribs } = await db
        .from('contributions')
        .select('amount')
        .eq('pool_id', pool_id)
        .eq('status', 'paid')

      const totalRaised = (contribs || []).reduce((sum, c) => sum + c.amount, 0)
      const cardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/card/${pool.slug}`

      await sendRecipientCard({
        to: pool.recipient_email,
        recipientName: pool.recipient,
        poolTitle: pool.title,
        cardUrl,
        contributorCount: (contribs || []).length,
        totalRaised,
      }).catch(err => console.error('Failed to send card email:', err))
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Close pool error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
