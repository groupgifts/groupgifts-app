import Link from 'next/link'
import Logo from '@/components/Logo'

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-[#F4F3F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-center">
        <Logo />
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <h1 className="text-3xl font-light italic mb-2" style={{fontFamily: 'Georgia, serif'}}>Refund Policy</h1>
          <p className="text-gray-400 text-sm mb-8">Last updated: April 2025</p>

          <div className="flex flex-col gap-8 text-sm text-gray-700 leading-relaxed">

            <section>
              <h2 className="font-semibold text-gray-900 mb-2">Full refunds for cancelled pools</h2>
              <p>
                If a pool organiser cancels a pool, all contributors receive a <strong>full refund</strong> —
                including any service fees paid at checkout. The refund is returned to the original payment
                method and typically appears within <strong>5–10 business days</strong>, depending on your bank or card issuer.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-900 mb-2">Individual contribution refunds</h2>
              <p>
                Pool organisers may refund individual contributions at their discretion while the pool is still active.
                Refunded contributors receive a full refund to their original payment method within 5–10 business days,
                along with a confirmation email.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-900 mb-2">Closed pools</h2>
              <p>
                Once a pool has been closed and a payout has been requested, contributions are no longer refundable
                through GroupGifts.me. If you have a dispute, please contact us at{' '}
                <a href="mailto:hello@groupgifts.me" className="text-[#E8733A] font-medium">hello@groupgifts.me</a>.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-900 mb-2">Service fees</h2>
              <p>
                A small service fee is added at checkout to cover payment processing and platform costs.
                This fee is <strong>fully refunded</strong> when a pool is cancelled or when an individual contribution is refunded.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-900 mb-2">Questions?</h2>
              <p>
                Reach us at{' '}
                <a href="mailto:hello@groupgifts.me" className="text-[#E8733A] font-medium">hello@groupgifts.me</a>{' '}
                and we'll get back to you within one business day.
              </p>
            </section>

          </div>

          <div className="mt-10 pt-6 border-t border-gray-100">
            <Link href="/" className="text-sm text-[#E8733A] font-medium">← Back to GroupGifts.me</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
