'use client'

import { DESIGN_STYLES, COLOR_PALETTES, WALL_COLORS } from '@/types/session'

interface StyleSurveyProps {
  selectedStyle: string | null
  selectedPalettes: string[]
  selectedWallColor: string | null
  onStyleChange: (style: string) => void
  onPaletteChange: (palettes: string[]) => void
  onWallColorChange: (color: string | null) => void
}

export function StyleSurvey({ selectedStyle, selectedPalettes, selectedWallColor, onStyleChange, onPaletteChange, onWallColorChange }: StyleSurveyProps) {
  function togglePalette(id: string) {
    if (selectedPalettes.includes(id)) {
      onPaletteChange(selectedPalettes.filter((p) => p !== id))
    } else {
      onPaletteChange([...selectedPalettes, id])
    }
  }

  return (
    <div className="space-y-8">
      {/* Design Style */}
      <div>
        <h3 className="mb-3 text-base font-semibold">Design Style</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {DESIGN_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => onStyleChange(style.id)}
              aria-pressed={selectedStyle === style.id}
              className={`rounded-xl border-2 px-4 py-4 text-left transition-all touch-manipulation min-h-[80px]
                ${selectedStyle === style.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card hover:border-primary/40'
                }`}
            >
              <span className="mb-1 block text-2xl" aria-hidden="true">{style.emoji}</span>
              <p className="text-sm font-semibold leading-tight">{style.label}</p>
              <p className={`mt-1 text-xs leading-snug ${selectedStyle === style.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {style.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Color Palette */}
      <div>
        <h3 className="mb-1 text-base font-semibold">Color Palette</h3>
        <p className="mb-3 text-sm text-muted-foreground">Pick one or more</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {COLOR_PALETTES.map((palette) => {
            const isSelected = selectedPalettes.includes(palette.id)
            return (
              <button
                key={palette.id}
                onClick={() => togglePalette(palette.id)}
                aria-pressed={isSelected}
                className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all touch-manipulation min-h-[60px]
                  ${isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40'}`}
              >
                <div
                  className="h-8 w-8 flex-shrink-0 rounded-full border shadow-sm"
                  style={{ backgroundColor: palette.hex }}
                  aria-hidden="true"
                />
                <div>
                  <p className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>{palette.label}</p>
                  <p className="text-xs text-muted-foreground">{palette.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Wall Color */}
      <div>
        <h3 className="mb-1 text-base font-semibold">Wall Color <span className="text-muted-foreground font-normal text-sm">(optional)</span></h3>
        <p className="mb-3 text-sm text-muted-foreground">We&apos;ll pick furniture that complements your walls.</p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {WALL_COLORS.map((color) => {
            const isSelected = selectedWallColor === color.id
            return (
              <button
                key={color.id}
                onClick={() => onWallColorChange(isSelected ? null : color.id)}
                aria-pressed={isSelected}
                title={color.label}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition-all touch-manipulation
                  ${isSelected ? 'border-primary' : 'border-border hover:border-primary/40'}`}
              >
                <div
                  className="h-10 w-10 rounded-full border shadow-sm"
                  style={{ backgroundColor: color.hex }}
                  aria-hidden="true"
                />
                <p className="text-xs font-medium text-center leading-tight">{color.label}</p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
