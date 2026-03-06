'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { StreamingParagraph } from '@/components/shared/StreamingText'

const REFINEMENT_EXAMPLES = [
  'Swap the sofa for something in navy blue',
  'Make it feel cozier and warmer',
  'Replace the coffee table with a round one',
  'Keep the rug but change the art',
]

interface RefineChatProps {
  planId: string
  sessionId: string
  onRefined: (newPlanId: string) => void
}

export function RefineChat({ planId, sessionId, onRefined }: RefineChatProps) {
  const [instruction, setInstruction] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [changesSummary, setChangesSummary] = useState('')
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!instruction.trim() || isStreaming) return

    setIsStreaming(true)
    setStreamingText('')
    setChangesSummary('')
    setError(null)

    try {
      const res = await fetch(`/api/plans/${planId}/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, instruction }),
      })

      if (!res.ok || !res.body) throw new Error('Refinement request failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))
            if (event.type === 'chunk') {
              setStreamingText((t) => t + event.text)
            } else if (event.type === 'done') {
              setChangesSummary(event.changesSummary ?? '')
              setInstruction('')
              onRefined(event.planId)
            } else if (event.type === 'error') {
              setError(event.message)
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">Refine Your Plan</h3>
        <p className="text-sm text-muted-foreground">Describe any changes and we&apos;ll update your room plan.</p>
      </div>

      {/* Example chips */}
      <div className="flex flex-wrap gap-2">
        {REFINEMENT_EXAMPLES.map((example) => (
          <button
            key={example}
            onClick={() => {
              setInstruction(example)
              textareaRef.current?.focus()
            }}
            className="rounded-full border bg-muted px-3 py-1.5 text-xs text-foreground hover:bg-muted/80 touch-manipulation"
          >
            {example}
          </button>
        ))}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          ref={textareaRef}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g. Replace the sofa with something in a warm terracotta tone..."
          rows={3}
          disabled={isStreaming}
          className="w-full resize-none rounded-xl border bg-background px-4 py-3 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
          aria-label="Refinement instruction"
        />
        <Button
          type="submit"
          disabled={!instruction.trim() || isStreaming}
          className="w-full h-12 text-base"
        >
          {isStreaming ? 'Updating your plan...' : 'Update Plan'}
        </Button>
      </form>

      {/* Streaming output */}
      {isStreaming && streamingText && (
        <div className="rounded-xl border bg-muted/50 p-4">
          <StreamingParagraph text={streamingText} isStreaming={isStreaming} />
        </div>
      )}

      {/* Changes summary */}
      {changesSummary && !isStreaming && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">✓ Plan Updated</p>
          <p className="mt-1 text-sm text-green-700 dark:text-green-300">{changesSummary}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
