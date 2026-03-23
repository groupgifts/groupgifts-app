import Logo from '@/components/Logo'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F4F3F0] flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        
        {/* Logo */}
        <div className="mb-8">
          <Logo size={36} />
          <p className="text-gray-500 mt-2 text-sm">Organise surprise group gifts — effortlessly.</p>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <Link href="/signup" className="bg-[#E8733A] text-white py-3 px-6 rounded-xl font-semibold text-sm hover:bg-[#C85E28] transition-colors">
            Create your first pool →
          </Link>
          <Link href="/login" className="bg-white text-gray-600 py-3 px-6 rounded-xl font-semibold text-sm border border-gray-200 hover:border-gray-400 transition-colors">
            Sign in
          </Link>
        </div>

      </div>
    </main>
  )
}