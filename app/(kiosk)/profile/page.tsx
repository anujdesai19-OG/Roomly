'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { StepProgress } from '@/components/kiosk/StepProgress'
import { useSessionContext } from '@/components/providers/SessionProvider'
import { toast } from 'sonner'

const RETAILER_ID = (process.env.NEXT_PUBLIC_RETAILER_ID ?? '').trim()

const inputClass = 'w-full border bg-white px-4 py-3 text-sm placeholder:text-[#C2B39F] focus:outline-none focus:ring-1 focus:ring-[#06060b]'
const labelClass = 'block text-xs uppercase tracking-[0.1em] mb-1.5'

export default function ProfilePage() {
  const router = useRouter()
  const { setSession } = useSessionContext()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [floorPlanNote, setFloorPlanNote] = useState('')
  const [floorPlanFile, setFloorPlanFile] = useState<File | null>(null)
  const [floorPlanPreview, setFloorPlanPreview] = useState<string | null>(null)
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFloorPlanFile(file)
    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => setFloorPlanPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setFloorPlanPreview(null)
    }
  }

  function removeFile() {
    setFloorPlanFile(null)
    setFloorPlanPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

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

      // Address lookup
      const addrRes = await fetch('/api/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      })
      const addressMeta = addrRes.ok
        ? await addrRes.json()
        : { beds: 2, baths: 2, rooms: ['LIVING_ROOM', 'BEDROOM'], source: 'stub' }

      if (floorPlanNote.trim()) {
        addressMeta.floorPlanNote = floorPlanNote.trim()
      }

      // If a floor plan image was uploaded, store base64 in sessionStorage for plan generation
      if (floorPlanFile && floorPlanFile.type.startsWith('image/')) {
        const reader = new FileReader()
        await new Promise<void>((resolve) => {
          reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string
            // Store raw base64 (strip data URL prefix) in sessionStorage
            const base64 = dataUrl.split(',')[1]
            if (base64) sessionStorage.setItem('roomly_floorplan_b64', base64)
            resolve()
          }
          reader.readAsDataURL(floorPlanFile)
        })
        addressMeta.hasFloorPlanImage = true
      }

      // Persist addressMeta to DB
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressMeta }),
      })

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

  const canSubmit = name && email && address && consent && !loading

  return (
    <div className="space-y-8">
      <StepProgress currentStep="PROFILE" />

      <div>
        <h1 className="mb-1 text-3xl" style={{ fontFamily: 'var(--font-instrument-serif)', color: '#06060b' }}>
          Let&apos;s get started.
        </h1>
        <p className="text-sm" style={{ color: '#5c5c5c' }}>
          Tell us a little about yourself so we can personalise your experience.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className={labelClass} htmlFor="name" style={{ color: '#5c5c5c' }}>Full name</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Johnson"
            autoComplete="name"
            required
            className={inputClass}
            style={{ borderColor: '#C2B39F' }}
          />
        </div>

        {/* Email */}
        <div>
          <label className={labelClass} htmlFor="email" style={{ color: '#5c5c5c' }}>Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@example.com"
            autoComplete="email"
            required
            className={inputClass}
            style={{ borderColor: '#C2B39F' }}
          />
          <p className="mt-1 text-xs" style={{ color: '#5c5c5c' }}>We&apos;ll send your room plan here.</p>
        </div>

        {/* Address */}
        <div>
          <label className={labelClass} htmlFor="address" style={{ color: '#5c5c5c' }}>Home address</label>
          <input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St, New York, NY"
            autoComplete="street-address"
            required
            className={inputClass}
            style={{ borderColor: '#C2B39F' }}
          />
          <p className="mt-1 text-xs" style={{ color: '#5c5c5c' }}>Used to understand your home layout. Never shared.</p>
        </div>

        {/* Floor plan section */}
        <div className="border p-5 space-y-4" style={{ borderColor: '#C2B39F' }}>
          <div>
            <p className="text-xs uppercase tracking-[0.1em] mb-0.5" style={{ color: '#5c5c5c' }}>
              Floor Plan <span style={{ color: '#C2B39F' }}>&mdash; Optional</span>
            </p>
            <p className="text-xs" style={{ color: '#5c5c5c' }}>
              Upload an image of your floor plan or describe your layout below. This helps us suggest better-fitting furniture.
            </p>
          </div>

          {/* File upload */}
          {!floorPlanFile ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border border-dashed py-6 text-xs uppercase tracking-widest transition-colors hover:bg-white"
              style={{ borderColor: '#C2B39F', color: '#5c5c5c' }}
            >
              Upload Floor Plan (JPG, PNG, PDF)
            </button>
          ) : (
            <div className="space-y-3">
              {floorPlanPreview ? (
                <div className="relative h-48 w-full overflow-hidden border" style={{ borderColor: '#C2B39F' }}>
                  <Image src={floorPlanPreview} alt="Floor plan preview" fill className="object-contain" />
                </div>
              ) : (
                <div className="flex items-center gap-3 border p-3" style={{ borderColor: '#C2B39F' }}>
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#5c5c5c' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="truncate text-xs" style={{ color: '#333333' }}>{floorPlanFile.name}</span>
                </div>
              )}
              <button
                type="button"
                onClick={removeFile}
                className="text-xs uppercase tracking-widest underline"
                style={{ color: '#5c5c5c' }}
              >
                Remove
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload floor plan"
          />

          {/* Text description fallback */}
          <div>
            <label className={labelClass} htmlFor="floorPlan" style={{ color: '#5c5c5c' }}>Or describe your layout</label>
            <textarea
              id="floorPlan"
              value={floorPlanNote}
              onChange={(e) => setFloorPlanNote(e.target.value)}
              placeholder="e.g. Open-concept living and dining area, ~400 sq ft. Living room is 15×20 ft with south-facing windows."
              rows={3}
              className="w-full resize-none border bg-white px-4 py-3 text-sm placeholder:text-[#C2B39F] focus:outline-none focus:ring-1 focus:ring-[#06060b]"
              style={{ borderColor: '#C2B39F' }}
            />
          </div>
        </div>

        {/* Consent */}
        <label className="flex cursor-pointer items-start gap-3 border p-4" style={{ borderColor: '#C2B39F' }}>
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer"
            required
            aria-required="true"
          />
          <span className="text-xs leading-relaxed" style={{ color: '#5c5c5c' }}>
            I agree that my name, email, and address may be stored to generate and deliver my room plan. Your information will not be sold or shared with third parties.
          </span>
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-4 text-xs font-medium uppercase tracking-widest text-white transition-opacity disabled:opacity-40"
          style={{ background: '#06060b' }}
        >
          {loading ? 'Setting up...' : 'Continue'}
        </button>
      </form>
    </div>
  )
}
