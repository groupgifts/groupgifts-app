import Link from 'next/link'

export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
        <rect x="7" y="26" width="30" height="16" rx="3" fill="#E8733A" opacity="0.9"/>
        <rect x="18" y="26" width="5" height="16" fill="white" opacity="0.2"/>
        <rect x="5" y="19" width="34" height="9" rx="3" fill="#C85E28" opacity="0.85"/>
        <rect x="18" y="19" width="5" height="9" fill="white" opacity="0.15"/>
        <path d="M22 19 C20 13 13 6 7 8 C3 10 3 15 8 17 C13 19 21 19 22 19Z" fill="#1A1A1A"/>
        <path d="M22 19 C24 13 31 6 37 8 C41 10 41 15 36 17 C31 19 23 19 22 19Z" fill="#1A1A1A"/>
        <path d="M20 20 C17 22 13 24 11 27" stroke="#1A1A1A" strokeWidth="2.8" strokeLinecap="round"/>
        <path d="M24 20 C27 22 31 24 33 27" stroke="#1A1A1A" strokeWidth="2.8" strokeLinecap="round"/>
        <circle cx="22" cy="19" r="4" fill="#1A1A1A"/>
        <circle cx="22" cy="19" r="1.8" fill="#E8733A"/>
      </svg>
      <span className="font-light italic text-xl" style={{fontFamily: 'Georgia, serif'}}>
        GroupGifts<span style={{color: '#E8733A'}}>.me</span>
      </span>
    </Link>
  )
}
