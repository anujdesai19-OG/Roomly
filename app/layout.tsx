import type { Metadata } from 'next'
import { Inter, Instrument_Serif } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { RetailerProvider } from '@/components/providers/RetailerProvider'
import { prisma } from '@/lib/db'
import './globals.css'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] })
const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
})

export const metadata: Metadata = {
  title: 'Roomly — Curated Room Design',
  description: 'Discover furniture you love. Build a room worth living in.',
}

async function getRetailerConfig() {
  const slug = process.env.NEXT_PUBLIC_RETAILER_SLUG ?? 'demo-furniture'
  const retailer = await prisma.retailer.findUnique({ where: { slug } }).catch(() => null)
  return retailer ?? {
    id: process.env.RETAILER_ID ?? '',
    slug,
    name: 'Roomly',
    logoUrl: null,
    primaryColor: '#1a1a2e',
    accentColor: '#e94560',
    contactEmail: 'hello@roomly.com',
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const retailer = await getRetailerConfig()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${instrumentSerif.variable} antialiased`}>
        <RetailerProvider config={retailer}>
          <SessionProvider>
            {children}
            <Toaster />
          </SessionProvider>
        </RetailerProvider>
      </body>
    </html>
  )
}
