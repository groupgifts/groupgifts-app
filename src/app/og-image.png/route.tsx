import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#FAFAFA',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Georgia, serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background gradient blobs */}
        <div style={{
          position: 'absolute', top: -60, left: -80,
          width: 400, height: 400, borderRadius: '50%',
          background: 'rgba(232,115,58,0.12)', filter: 'blur(60px)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, right: -60,
          width: 350, height: 350, borderRadius: '50%',
          background: 'rgba(24,184,148,0.10)', filter: 'blur(60px)',
          display: 'flex',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: '#E8733A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30,
          }}>🎁</div>
          <span style={{ fontSize: 36, fontStyle: 'italic', color: '#0D0D0D' }}>
            GroupGifts<span style={{ color: '#E8733A' }}>.me</span>
          </span>
        </div>

        {/* Headline */}
        <div style={{
          fontSize: 72, fontWeight: 400, lineHeight: 1.1,
          color: '#0D0D0D', textAlign: 'center', maxWidth: 900,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <span>They'll never know</span>
          <span style={{ fontStyle: 'italic', color: '#E8733A' }}>how easy this was.</span>
        </div>

        {/* Sub */}
        <div style={{
          fontSize: 24, color: '#3A3A3A', marginTop: 28, textAlign: 'center',
          maxWidth: 700, fontFamily: 'sans-serif', fontWeight: 300,
          display: 'flex',
        }}>
          Pool money with friends · Pick the perfect gift · Keep it a surprise
        </div>

        {/* CTA pill */}
        <div style={{
          marginTop: 48, background: '#0D0D0D', color: '#fff',
          padding: '14px 36px', borderRadius: 14,
          fontSize: 20, fontFamily: 'sans-serif', fontWeight: 600,
          display: 'flex',
        }}>
          Start a gift pool →
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
