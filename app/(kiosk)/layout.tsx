import Link from 'next/link'

export default function KioskLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#EFEEEA' }}>
      {/* Rove-style minimal header */}
      <header className="sticky top-0 z-10 border-b" style={{ background: '#EFEEEA', borderColor: '#C2B39F' }}>
        <div className="mx-auto flex max-w-lg items-center justify-center px-4 py-4">
          <Link href="/" className="tracking-[0.2em] text-sm font-medium uppercase" style={{ color: '#06060b', fontFamily: 'var(--font-inter)' }}>
            ROOMLY
          </Link>
        </div>
      </header>

      <div className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-lg">
          {children}
        </div>
      </div>
    </div>
  )
}
