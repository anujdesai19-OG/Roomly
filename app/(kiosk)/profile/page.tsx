'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StepProgress } from '@/components/kiosk/StepProgress'
import { useSessionContext } from '@/components/providers/SessionProvider'
import { toast } from 'sonner'

const RETAILER_ID = (process.env.NEXT_PUBLIC_RETAILER_ID ?? '').trim()

export default function ProfilePage() {
  const router = useRouter()
  const { setSession } = useSessionContext()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [floorPlanNote, setFloorPlanNote] = useState('')
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !address || !consent) return
    setLoading(true)

    try {
      // Create session
      const sessionRes = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId: RETAILER_ID,
          shopperName: name,
          email,
          address,
          consentGiven: true,
        }),
      })

      if (!sessionRes.ok) throw new Error('Failed to create session')
      const { sessionId, resumeToken } = await sessionRes.json()

      // Stub address lookup
      const addrRes = await fetch('/api/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      })
      const addressMeta = addrRes.ok ? await addrRes.json() : { beds: 2, baths: 2, rooms: ['LIVING_ROOM', 'BEDROOM'], source: 'stub' }

      // Merge optional floor plan note into addressMeta and persist to DB
      if (floorPlanNote.trim()) {
        addressMeta.floorPlanNote = floorPlanNote.trim()
      }
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressMeta }),
      })

      // Store in context
      setSession({
        id: sessionId,
        resumeToken,
        shopperName: name,
        email,
        address,
        addressMeta,
        consentGiven: true,
        currentStep: 'ROOMS',
        selectedRooms: addressMeta.rooms ?? [],
        colorPalette: [],
      })

      router.push('/rooms')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <StepProgress currentStep="PROFILE" />

      <div>
        <h1 className="text-2xl font-bold">Let&apos;s get started</h1>
        <p className="mt-1 text-muted-foreground">Tell us a little about yourself so we can personalize your experience.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="name">Full name</label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Johnson"
            autoComplete="name"
            required
            className="h-12 text-base"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">Email address</label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@example.com"
            autoComplete="email"
            required
            className="h-12 text-base"
          />
          <p className="text-xs text-muted-foreground">We&apos;ll send your room plan here.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="address">Home address</label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St, New York, NY"
            autoComplete="street-address"
            required
            className="h-12 text-base"
          />
          <p className="text-xs text-muted-foreground">Used to understand your home layout. Never shared.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="floorPlan">
            Floor plan <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <textarea
            id="floorPlan"
            value={floorPlanNote}
            onChange={(e) => setFloorPlanNote(e.target.value)}
            placeholder="e.g. Open-concept living and dining area, ~400 sq ft. Living room is 15×20 ft with a south-facing window wall."
            rows={3}
            className="w-full resize-none rounded-xl border bg-background px-4 py-3 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-muted-foreground">Describe your room dimensions or layout to get a better-fitting plan.</p>
        </div>

        {/* Consent */}
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-muted/50 p-4">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-5 w-5 flex-shrink-0 cursor-pointer accent-primary"
            required
            aria-required="true"
          />
          <span className="text-sm text-muted-foreground leading-relaxed">
            I agree that my name, email, and address may be stored to generate and deliver my room plan. Your information will not be sold or shared with third parties.
          </span>
        </label>

        <Button
          type="submit"
          disabled={!name || !email || !address || !consent || loading}
          className="w-full h-12 text-base"
        >
          {loading ? 'Setting up...' : 'Continue →'}
        </Button>
      </form>
    </div>
  )
}
