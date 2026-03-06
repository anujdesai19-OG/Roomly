'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { StepProgress } from '@/components/kiosk/StepProgress'
import { StyleSurvey } from '@/components/kiosk/StyleSurvey'
import { useSessionContext } from '@/components/providers/SessionProvider'
import { toast } from 'sonner'

export default function StylePage() {
  const router = useRouter()
  const { session, updateSession } = useSessionContext()

  const designStyle = session?.designStyle ?? null
  const colorPalette = session?.colorPalette ?? []

  async function handleContinue() {
    if (!designStyle || colorPalette.length === 0) return
    if (!session?.id) { router.push('/profile'); return }

    try {
      await fetch(`/api/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designStyle, colorPalette, currentStep: 'BUDGET' }),
      })
      updateSession({ designStyle, colorPalette, currentStep: 'BUDGET' })
      router.push('/budget')
    } catch {
      toast.error('Failed to save style. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <StepProgress currentStep="STYLE" />

      <div>
        <h1 className="text-2xl font-bold">What&apos;s your style?</h1>
        <p className="mt-1 text-muted-foreground">Choose a design style and your preferred color palette.</p>
      </div>

      <StyleSurvey
        selectedStyle={designStyle}
        selectedPalettes={colorPalette}
        onStyleChange={(style) => updateSession({ designStyle: style })}
        onPaletteChange={(palettes) => updateSession({ colorPalette: palettes })}
      />

      <Button
        onClick={handleContinue}
        disabled={!designStyle || colorPalette.length === 0}
        className="w-full h-12 text-base"
      >
        Continue →
      </Button>
    </div>
  )
}
