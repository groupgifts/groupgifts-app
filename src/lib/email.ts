import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'GroupGifts.me <noreply@groupgifts.me>'

export async function sendContributorReceipt({
  to,
  contributorName,
  amount,
  poolTitle,
  recipient,
  slug,
}: {
  to: string
  contributorName: string
  amount: number
  poolTitle: string
  recipient: string
  slug: string
}) {
  const poolUrl = `https://groupgifts.me/contribute/${slug}`

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your contribution to ${poolTitle} — receipt`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
        <div style="font-size: 32px; margin-bottom: 16px;">🎁</div>
        <h1 style="font-size: 24px; font-weight: 300; font-style: italic; margin: 0 0 8px;">You're in, ${contributorName}!</h1>
        <p style="color: #888; font-size: 14px; margin: 0 0 32px;">Your contribution has been confirmed. The organiser will collect all contributions and coordinate the gift purchase.</p>

        <div style="background: #F4F3F0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <div style="font-size: 13px; color: #888; margin-bottom: 4px;">Pool</div>
          <div style="font-size: 16px; font-weight: 600;">${poolTitle}</div>
          <div style="font-size: 13px; color: #888; margin-top: 12px; margin-bottom: 4px;">For</div>
          <div style="font-size: 16px;">${recipient}</div>
          <div style="font-size: 13px; color: #888; margin-top: 12px; margin-bottom: 4px;">Your contribution</div>
          <div style="font-size: 22px; font-weight: 700; color: #E8733A;">$${amount.toFixed(2)}</div>
        </div>

        <a href="${poolUrl}"
          style="display: block; background: #E8733A; color: white; text-align: center; padding: 14px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600; margin-bottom: 32px;">
          View the pool →
        </a>

        <p style="font-size: 13px; color: #aaa; text-align: center;">
          Made with <a href="https://groupgifts.me" style="color: #E8733A; text-decoration: none;">GroupGifts.me</a>
        </p>
      </div>
    `,
  })
}

export async function sendRecipientCard({
  to,
  recipientName,
  poolTitle,
  cardUrl,
  contributorCount,
  totalRaised,
}: {
  to: string
  recipientName: string
  poolTitle: string
  cardUrl: string
  contributorCount: number
  totalRaised: number
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `You have a gift from ${contributorCount} people 🎁`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
        <div style="font-size: 40px; margin-bottom: 16px; text-align: center;">🎁</div>
        <h1 style="font-size: 26px; font-weight: 300; font-style: italic; text-align: center; margin: 0 0 8px;">${poolTitle}</h1>
        <p style="color: #888; font-size: 14px; text-align: center; margin: 0 0 32px;">
          ${contributorCount} people came together and raised <strong style="color: #E8733A;">$${totalRaised.toFixed(0)}</strong> for you.
        </p>

        <a href="${cardUrl}"
          style="display: block; background: linear-gradient(135deg, #1A1A2E, #2D1B4E); color: white; text-align: center; padding: 18px; border-radius: 14px; text-decoration: none; font-size: 15px; font-weight: 600; margin-bottom: 32px;">
          Open your card →
        </a>

        <p style="font-size: 13px; color: #aaa; text-align: center;">
          Made with <a href="https://groupgifts.me" style="color: #E8733A; text-decoration: none;">GroupGifts.me</a>
        </p>
      </div>
    `,
  })
}

export async function sendOrganiserNotification({
  to,
  organiserName,
  contributorName,
  amount,
  poolTitle,
  slug,
  totalRaised,
  goal,
}: {
  to: string
  organiserName: string
  contributorName: string
  amount: number
  poolTitle: string
  slug: string
  totalRaised: number
  goal: number
}) {
  const pct = Math.min(100, Math.round((totalRaised / goal) * 100))

  await resend.emails.send({
    from: FROM,
    to,
    subject: `${contributorName} just chipped in $${amount} to ${poolTitle}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
        <div style="font-size: 32px; margin-bottom: 16px;">🎉</div>
        <h1 style="font-size: 24px; font-weight: 300; font-style: italic; margin: 0 0 8px;">New contribution!</h1>
        <p style="color: #888; font-size: 14px; margin: 0 0 32px;">
          <strong>${contributorName}</strong> just contributed <strong style="color: #E8733A;">$${amount.toFixed(2)}</strong> to <strong>${poolTitle}</strong>.
        </p>

        <div style="background: #F4F3F0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 13px; color: #888;">Progress</span>
            <span style="font-size: 13px; font-weight: 600;">${pct}%</span>
          </div>
          <div style="background: #e5e7eb; border-radius: 999px; height: 8px; overflow: hidden;">
            <div style="background: #E8733A; height: 8px; width: ${pct}%; border-radius: 999px;"></div>
          </div>
          <div style="font-size: 13px; color: #888; margin-top: 8px;">$${totalRaised.toFixed(0)} raised of $${goal} goal</div>
        </div>

        <a href="https://groupgifts.me/pool/${slug}"
          style="display: block; background: #E8733A; color: white; text-align: center; padding: 14px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600;">
          View pool →
        </a>

        <p style="font-size: 13px; color: #aaa; text-align: center; margin-top: 24px;">
          Made with <a href="https://groupgifts.me" style="color: #E8733A; text-decoration: none;">GroupGifts.me</a>
        </p>
      </div>
    `,
  })
}
