import Link from 'next/link'
import Image from 'next/image'

const HERO_IMAGE = 'https://cdn.roveconcepts.com/sites/default/files/styles/uc_product/public/Kyoto_3Seater_KyotoTruffle_PerformanceLinen_Dove_1.jpg'
const GRID_IMAGES = [
  'https://cdn.roveconcepts.com/sites/default/files/styles/uc_product/public/Athena_Coffee_Table_Ebony_Black_Pietra_Ceramic_1.jpg',
  'https://cdn.roveconcepts.com/sites/default/files/styles/uc_product/public/Forja-Lounge-Chair_Mohair_Cognac_1.jpg',
  'https://cdn.roveconcepts.com/sites/default/files/styles/uc_product/public/Bilbao_Sofa_Modern_Felt_Alesund_1_0.jpg',
  'https://cdn.roveconcepts.com/sites/default/files/styles/uc_product/public/Magnus_Nightstand_Grey_Oak_1.jpg',
]

const STEPS = [
  { n: '01', title: 'Tell us about your space', body: 'Share your address and style preferences. Optionally upload a floor plan for a more tailored result.' },
  { n: '02', title: 'Browse & swipe', body: 'Swipe through curated pieces matched to your taste and budget.' },
  { n: '03', title: 'Receive your room plan', body: 'Get a complete, shoppable room plan delivered to your inbox.' },
]

export default function Home() {
  return (
    <div style={{ background: '#EFEEEA', color: '#333333', fontFamily: 'var(--font-inter)' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b" style={{ background: '#EFEEEA', borderColor: '#C2B39F' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="tracking-[0.2em] text-sm font-medium uppercase" style={{ color: '#06060b' }}>ROOMLY</span>
          <Link
            href="/profile"
            className="border px-5 py-2 text-xs font-medium uppercase tracking-widest transition-colors hover:bg-[#06060b] hover:text-white"
            style={{ borderColor: '#06060b', color: '#06060b' }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 lg:items-center">
          <div className="space-y-8">
            <p className="text-xs uppercase tracking-[0.3em]" style={{ color: '#5c5c5c' }}>AI-Powered Room Design</p>
            <h1
              className="leading-[1.05] text-5xl sm:text-6xl lg:text-7xl"
              style={{ fontFamily: 'var(--font-instrument-serif)', color: '#06060b' }}
            >
              A room<br />worth living in.
            </h1>
            <p className="max-w-md text-base leading-relaxed" style={{ color: '#5c5c5c' }}>
              Tell us your style and budget. Swipe through hand-curated furniture. Receive a personalized room plan — complete with everything you need to shop it today.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/profile"
                className="inline-flex items-center justify-center px-8 py-3.5 text-xs font-medium uppercase tracking-widest text-white transition-opacity hover:opacity-80"
                style={{ background: '#06060b' }}
              >
                Design My Room
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center border px-8 py-3.5 text-xs font-medium uppercase tracking-widest transition-colors hover:bg-[#06060b] hover:text-white"
                style={{ borderColor: '#C2B39F', color: '#333333' }}
              >
                How It Works
              </a>
            </div>
            <p className="text-xs" style={{ color: '#5c5c5c' }}>No account required &middot; Takes about 5 minutes</p>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={HERO_IMAGE}
              alt="Kyoto sofa in a beautifully designed living room"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </section>

      {/* Image grid */}
      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {GRID_IMAGES.map((src, i) => (
            <div key={i} className="relative aspect-square overflow-hidden">
              <Image
                src={src}
                alt="Curated furniture piece"
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t py-20" style={{ borderColor: '#C2B39F' }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs uppercase tracking-[0.3em]" style={{ color: '#5c5c5c' }}>The Process</p>
            <h2 className="text-4xl" style={{ fontFamily: 'var(--font-instrument-serif)', color: '#06060b' }}>
              Three steps to your perfect room.
            </h2>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n} className="space-y-4 border-t pt-6" style={{ borderColor: '#C2B39F' }}>
                <p className="font-mono text-xs" style={{ color: '#5c5c5c' }}>{step.n}</p>
                <h3 className="text-xl" style={{ fontFamily: 'var(--font-instrument-serif)', color: '#06060b' }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#5c5c5c' }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature callout */}
      <section className="border-t py-20" style={{ background: '#06060b', borderColor: '#06060b' }}>
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.3em]" style={{ color: '#C2B39F' }}>Powered by AI</p>
          <h2
            className="mx-auto mb-6 max-w-2xl text-4xl sm:text-5xl leading-tight"
            style={{ fontFamily: 'var(--font-instrument-serif)', color: '#FFFFFF' }}
          >
            Every recommendation is personal.
          </h2>
          <p className="mx-auto mb-10 max-w-lg text-sm leading-relaxed" style={{ color: '#C2B39F' }}>
            We learn your style from what you swipe, not just what you say. The result is a room plan that actually feels like you.
          </p>
          <Link
            href="/profile"
            className="inline-flex items-center justify-center border px-10 py-4 text-xs font-medium uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-[#06060b]"
            style={{ borderColor: '#FFFFFF' }}
          >
            Start Designing
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8" style={{ borderColor: '#C2B39F' }}>
        <div className="mx-auto max-w-6xl px-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="tracking-[0.2em] text-xs font-medium uppercase" style={{ color: '#06060b' }}>ROOMLY</span>
          <p className="text-xs" style={{ color: '#5c5c5c' }}>
            Your data is never sold. Plans are yours to keep.
          </p>
        </div>
      </footer>
    </div>
  )
}
