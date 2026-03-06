import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/db'

async function getRetailer() {
  const slug = process.env.NEXT_PUBLIC_RETAILER_SLUG ?? 'demo-furniture'
  return prisma.retailer.findUnique({ where: { slug } }).catch(() => null)
}

export default async function LandingPage() {
  const retailer = await getRetailer()
  const name = retailer?.name ?? 'Roomly'

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-8 text-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{name}</h1>
          <p className="mt-2 text-lg text-muted-foreground">Personalized Room Design</p>
        </div>

        <div className="space-y-2">
          <p className="text-xl font-medium">Find furniture you&apos;ll love. Build a room you&apos;ll live in.</p>
          <p className="text-muted-foreground">
            Answer a few questions about your style and budget, then swipe through curated furniture picks.
            We&apos;ll create a personalized room plan you can shop today.
          </p>
        </div>

        <div className="grid w-full grid-cols-3 gap-4 text-center">
          {[
            { icon: '✨', label: 'Style-matched picks' },
            { icon: '💰', label: 'Budget-aware' },
            { icon: '📐', label: 'Room plan included' },
          ].map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4">
              <span className="text-3xl">{f.icon}</span>
              <span className="text-xs font-medium">{f.label}</span>
            </div>
          ))}
        </div>

        <Button asChild size="lg" className="h-14 w-full max-w-xs text-lg">
          <Link href="/profile">Let&apos;s Design Your Room →</Link>
        </Button>

        <p className="text-xs text-muted-foreground">Takes about 5 minutes · No account required</p>
      </div>
    </main>
  )
}
