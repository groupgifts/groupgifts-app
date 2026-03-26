'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'

const SERIF = "'Instrument Serif', Georgia, serif"
const SANS = "'DM Sans', system-ui, sans-serif"

export default function Home() {
  const sectionsRef = useRef<HTMLElement[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) e.target.classList.add('gg-visible')
        })
      },
      { threshold: 0.1 }
    )
    document.querySelectorAll('.gg-fade').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <style>{`
        @keyframes gg-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.04); }
        }
        @keyframes gg-fadeup {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .gg-fade {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .gg-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .gg-orb {
          position: absolute; border-radius: 50%; filter: blur(40px); opacity: 0.5;
          animation: gg-float 8s ease-in-out infinite;
        }
        .gg-a1 { animation: gg-fadeup 0.6s 0.0s ease both; }
        .gg-a2 { animation: gg-fadeup 0.6s 0.1s ease both; }
        .gg-a3 { animation: gg-fadeup 0.6s 0.2s ease both; }
        .gg-a4 { animation: gg-fadeup 0.6s 0.3s ease both; }
        .gg-a5 { animation: gg-fadeup 0.8s 0.5s ease both; }
        .step-card { transition: box-shadow 0.2s, transform 0.2s; }
        .step-card:hover { box-shadow: 0 12px 48px rgba(0,0,0,0.11); transform: translateY(-3px); }
        .feature-cell { transition: background 0.2s; }
        .feature-cell:hover { background: #161616; }
      `}</style>

      <div style={{ background: '#FAFAFA', color: '#0D0D0D', fontFamily: SANS, overflowX: 'hidden' }}>

        {/* ── NAV ── */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(250,250,250,0.88)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid #E8E8E8',
          height: 62,
          display: 'flex', alignItems: 'center',
        }}>
          <div style={{
            maxWidth: 1100, margin: '0 auto', padding: '0 32px',
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <Logo />
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <Link href="/login" style={{ fontSize: 14, color: '#888', textDecoration: 'none', fontWeight: 400 }}>
                Sign in
              </Link>
              <Link href="/signup" style={{
                background: '#0D0D0D', color: '#fff', fontSize: 13, fontWeight: 500,
                padding: '9px 20px', borderRadius: 10, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                transition: 'background 0.2s',
              }}>
                Start a pool →
              </Link>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '120px 24px 80px',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Mesh gradient */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            background: `
              radial-gradient(ellipse 60% 50% at 20% 20%, rgba(201,147,58,0.08) 0%, transparent 60%),
              radial-gradient(ellipse 50% 60% at 80% 80%, rgba(29,184,160,0.07) 0%, transparent 60%),
              radial-gradient(ellipse 40% 40% at 60% 10%, rgba(232,86,106,0.05) 0%, transparent 50%)
            `,
          }} />
          {/* Orbs */}
          <div className="gg-orb" style={{ width: 300, height: 300, background: 'rgba(201,147,58,0.12)', top: '10%', left: -80, animationDelay: '0s' }} />
          <div className="gg-orb" style={{ width: 250, height: 250, background: 'rgba(29,184,160,0.10)', bottom: '15%', right: -60, animationDelay: '3s' }} />
          <div className="gg-orb" style={{ width: 200, height: 200, background: 'rgba(232,86,106,0.08)', top: '40%', left: '55%', animationDelay: '5s' }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 760 }}>
            {/* Badge */}
            <div className="gg-a1" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: '#fff', border: '1px solid #E8E8E8',
              borderRadius: 99, padding: '6px 14px 6px 8px',
              fontSize: 12, fontWeight: 500, color: '#3A3A3A',
              marginBottom: 32, boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: '#E6FAF6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
              }}>🤫</div>
              Built for the person organising the surprise
            </div>

            {/* Headline */}
            <h1 className="gg-a2" style={{
              fontFamily: SERIF,
              fontSize: 'clamp(48px, 7vw, 86px)',
              fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em',
              color: '#0D0D0D', marginBottom: 24,
            }}>
              They'll never know<br />how{' '}
              <em style={{ fontStyle: 'italic', color: '#E8733A' }}>easy this was.</em>
            </h1>

            {/* Sub */}
            <p className="gg-a3" style={{
              fontSize: 'clamp(16px, 2vw, 20px)', fontWeight: 300, color: '#3A3A3A',
              lineHeight: 1.65, maxWidth: 540, margin: '0 auto 44px',
            }}>
              You're the one making it happen — coordinating everyone, picking the perfect gift, keeping it a secret. GroupGifts.me does the heavy lifting so you can take all the credit.
            </p>

            {/* CTAs */}
            <div className="gg-a4" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
              <Link href="/signup" style={{
                background: '#0D0D0D', color: '#fff',
                padding: '14px 32px', borderRadius: 14,
                fontSize: 15, fontWeight: 600, textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>
                Start a gift pool →
              </Link>
              <Link href="/login" style={{
                background: '#fff', color: '#0D0D0D',
                border: '1.5px solid #E8E8E8',
                padding: '14px 28px', borderRadius: 14,
                fontSize: 15, fontWeight: 500, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>
                Sign in
              </Link>
            </div>

            {/* Social proof */}
            <div className="gg-a4" style={{ fontSize: 13, color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <div style={{ display: 'flex' }}>
                {[['M','#FFD89B'],['J','#B8F0E6'],['S','#FFB8C1'],['R','#C8B8FF']].map(([l, bg], i) => (
                  <div key={i} style={{
                    width: 24, height: 24, borderRadius: '50%',
                    border: '2px solid #FAFAFA',
                    background: bg as string,
                    marginLeft: i === 0 ? 0 : -6,
                    fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3A3A3A',
                  }}>{l}</div>
                ))}
              </div>
              <span>Free to set up · No account needed to contribute</span>
            </div>
          </div>

          {/* Browser mockup */}
          <div className="gg-a5" style={{ position: 'relative', zIndex: 1, marginTop: 64, width: '100%', maxWidth: 680 }}>
            <div style={{
              background: '#fff', border: '1px solid #E8E8E8', borderRadius: 20,
              boxShadow: '0 12px 48px rgba(0,0,0,0.11)', overflow: 'hidden',
            }}>
              <div style={{ background: '#F5F5F5', borderBottom: '1px solid #E8E8E8', padding: '12px 18px', display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
                <div style={{ flex: 1, height: 20, background: '#EBEBEB', borderRadius: 6, marginLeft: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 11, color: '#999' }}>app.groupgifts.me/pool/fernandas-birthday</span>
                </div>
              </div>
              <div style={{ padding: 24 }}>
                <MockCard
                  title="Fernanda's Birthday 🎂"
                  sub="For Fernanda R. · Birthday · July 14"
                  amount="$340"
                  goal="$487"
                  pct={70}
                  color="#E8733A"
                  contributors={['M','I','D']}
                  contributorColors={['#5B6AF0','#F06B7A','#2BBFA4']}
                  label="4 contributors"
                  badge="Active"
                  badgeBg="#FEF3ED"
                  badgeColor="#E8733A"
                />
                <div style={{ marginTop: 12 }}>
                  <MockCard
                    title="Carolina's 50th 🎊"
                    sub="For Carolina V. · Birthday · Oct 18"
                    amount="$1,850"
                    goal="$1,000"
                    pct={100}
                    color="#F06B7A"
                    contributors={['V','T','S']}
                    contributorColors={['#9B6BF0','#2B9BF0','#E8733A']}
                    label="18 contributors"
                    badge="🎉 Complete"
                    badgeBg="#FEF0F2"
                    badgeColor="#E8566A"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── OCCASIONS STRIP ── */}
        <div style={{ background: '#0D0D0D', padding: '24px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', marginRight: 4, whiteSpace: 'nowrap' }}>Perfect for</span>
            {['🎂 Birthdays','💍 Weddings','🍼 Baby Showers','🎓 Graduations','🥂 Retirements','💝 Anniversaries','✈️ Farewells'].map(tag => (
              <span key={tag} style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 99, padding: '6px 16px' }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <section style={{ background: '#fff', padding: '100px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }} className="gg-fade">
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#E8733A', marginBottom: 14 }}>How it works</div>
            <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(32px,4vw,52px)', fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 16 }}>
              You organise.<br /><em style={{ fontStyle: 'italic' }}>Everyone chips in.</em>
            </h2>
            <p style={{ fontSize: 17, fontWeight: 300, color: '#3A3A3A', lineHeight: 1.7, maxWidth: 520, marginBottom: 0 }}>
              No group chats, no awkward reminders, no Venmo confusion. You run the whole thing privately — the recipient never sees a thing.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginTop: 64 }}>
              {[
                { n: '1', title: 'You create the pool', desc: "Pick the gift, set the goal, name the occasion. You're in full control — the recipient is never notified and never sees the pool. Their surprise stays safe." },
                { n: '2', title: 'You share the link privately', desc: 'Send a private link to contributors — friends, family, colleagues. They chip in at their own pace, leave a personal note, and you track progress in real time.' },
                { n: '3', title: 'You make the moment', desc: "Once funded, money transfers directly to you. Buy the gift, wrap it up, and watch their face. GroupGifts.me handled the chaos — you get the glory." },
              ].map(step => (
                <div key={step.n} className="step-card" style={{ background: '#fff', border: '1px solid #E8E8E8', borderRadius: 14, padding: '32px 28px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#0D0D0D', color: '#fff', fontFamily: SERIF, fontSize: 22, fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>{step.n}</div>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>{step.title}</div>
                  <div style={{ fontSize: 14, fontWeight: 300, color: '#3A3A3A', lineHeight: 1.7 }}>{step.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section style={{ background: '#0D0D0D', padding: '100px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="gg-fade" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 48 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#E8733A', marginBottom: 14 }}>Features</div>
                <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(32px,4vw,52px)', fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.02em', color: '#fff', marginBottom: 0 }}>
                  Everything the organiser<br /><em style={{ fontStyle: 'italic' }}>actually needs.</em>
                </h2>
              </div>
              <p style={{ fontSize: 16, fontWeight: 300, color: 'rgba(255,255,255,0.45)', maxWidth: 320, lineHeight: 1.65, margin: 0 }}>
                You're juggling people, money, and a secret. We handle the rest.
              </p>
            </div>
            <div className="gg-fade">
              {[
                { icon: '🤫', title: '100% private from the recipient', desc: 'The recipient never gets a notification or sees the pool — until you reveal it.' },
                { icon: '📲', title: 'No app needed for contributors', desc: 'Share a link over text or WhatsApp. They chip in instantly — zero sign-up required.' },
                { icon: '💸', title: 'Funds paid directly to you', desc: 'All contributions collected securely via Stripe. Transferred to your account within 2 business days.' },
                { icon: '🔄', title: 'Swap the gift anytime', desc: 'Found something better? Change mid-pool and the goal updates instantly.' },
                { icon: '💌', title: 'Digital card for the recipient', desc: 'When you close the pool, the recipient gets a beautiful digital card with everyone\'s messages.' },
                { icon: '🎯', title: 'Split evenly or open contributions', desc: 'Let people chip in whatever they want, or set an even split so the math does itself.' },
              ].map((f, i) => (
                <div key={i} className="feature-cell" style={{
                  display: 'flex', alignItems: 'center', gap: 20,
                  borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  padding: '16px 0',
                }}>
                  <span style={{ fontSize: 18, width: 28, textAlign: 'center', flexShrink: 0 }}>{f.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#fff', minWidth: 240, flexShrink: 0 }}>{f.title}</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{f.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section style={{
          textAlign: 'center', padding: '120px 24px',
          background: 'linear-gradient(180deg, #FAFAFA 0%, #FDF8F2 100%)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(201,147,58,0.06) 0%, transparent 70%)' }} />
          <div className="gg-fade" style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(36px,5vw,64px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#0D0D0D', marginBottom: 20 }}>
              Make the gift<br /><em style={{ fontStyle: 'italic', color: '#E8733A' }}>they'll never forget.</em>
            </h2>
            <p style={{ fontSize: 17, fontWeight: 300, color: '#3A3A3A', maxWidth: 440, margin: '0 auto 40px', lineHeight: 1.65 }}>
              Free to set up. No account needed to contribute. The recipient never knows until you're ready.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/signup" style={{
                background: '#E8733A', color: '#fff',
                padding: '16px 36px', borderRadius: 14,
                fontSize: 16, fontWeight: 600, textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(232,115,58,0.35)',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>
                Start a gift pool →
              </Link>
              <Link href="/login" style={{
                background: 'transparent', color: '#0D0D0D',
                border: '1.5px solid #E8E8E8',
                padding: '16px 28px', borderRadius: 14,
                fontSize: 16, fontWeight: 500, textDecoration: 'none',
              }}>
                Sign in
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ background: '#0D0D0D', color: 'rgba(255,255,255,0.4)', padding: '48px 32px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <span style={{ fontFamily: SERIF, fontSize: 18, fontStyle: 'italic', color: '#fff' }}>
              GroupGifts<span style={{ color: '#E8733A' }}>.me</span>
            </span>
            <div style={{ display: 'flex', gap: 28 }}>
              <a href="mailto:hello@groupgifts.me" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>hello@groupgifts.me</a>
            </div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>© 2025 GroupGifts.me</span>
          </div>
        </footer>

      </div>
    </>
  )
}

function MockCard({ title, sub, amount, goal, pct, color, contributors, contributorColors, label, badge, badgeBg, badgeColor }: {
  title: string, sub: string, amount: string, goal: string, pct: number,
  color: string, contributors: string[], contributorColors: string[],
  label: string, badge: string, badgeBg: string, badgeColor: string,
}) {
  return (
    <div style={{ border: '1px solid #E8E8E8', borderRadius: 14, padding: '18px 20px', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#0D0D0D', marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{sub}</div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 8, background: badgeBg, color: badgeColor, whiteSpace: 'nowrap' }}>{badge}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color }}>{amount}</div>
          <div style={{ fontSize: 12, color: '#888' }}>of {goal} goal</div>
        </div>
        <div style={{ display: 'flex' }}>
          {contributors.map((c, i) => (
            <div key={i} style={{
              width: 22, height: 22, borderRadius: '50%', border: '2px solid #fff',
              marginLeft: i === 0 ? 0 : -6, background: contributorColors[i],
              fontSize: 9, fontWeight: 700, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{c}</div>
          ))}
          <span style={{ fontSize: 11, color: '#888', alignSelf: 'center', marginLeft: 6 }}>{label}</span>
        </div>
      </div>
      <div style={{ height: 6, background: '#EBEBEB', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: `linear-gradient(90deg, ${color}, ${color}cc)` }} />
      </div>
    </div>
  )
}
