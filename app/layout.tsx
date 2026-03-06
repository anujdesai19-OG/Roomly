import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { RetailerProvider } from '@/components/providers/RetailerProvider'
import { prisma } from '@/lib/db'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Roomly — Personalized Room Design',
  description: 'Design your perfect room with AI-powered furniture recommendations.',
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
