import Anthropic from '@anthropic-ai/sdk'

const globalForAnthropic = globalThis as unknown as {
  anthropic: Anthropic | undefined
}

export const anthropic =
  globalForAnthropic.anthropic ??
  new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

if (process.env.NODE_ENV !== 'production') globalForAnthropic.anthropic = anthropic

export const FAST_MODEL = 'claude-haiku-4-5-20251001'
export const QUALITY_MODEL = 'claude-sonnet-4-6'
