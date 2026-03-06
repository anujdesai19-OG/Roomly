'use client'

import { useEffect, useRef } from 'react'

interface StreamingTextProps {
  text: string
  isStreaming?: boolean
  className?: string
}

export function StreamingText({ text, isStreaming = false, className = '' }: StreamingTextProps) {
  return (
    <span className={className}>
      {text}
      {isStreaming && (
        <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-current align-middle" aria-hidden="true" />
      )}
    </span>
  )
}

export function StreamingParagraph({ text, isStreaming = false }: { text: string; isStreaming?: boolean }) {
  const ref = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (isStreaming && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [text, isStreaming])

  return (
    <p ref={ref} className="text-base leading-relaxed text-foreground">
      {text}
      {isStreaming && (
        <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-current align-middle" aria-hidden="true" />
      )}
    </p>
  )
}
