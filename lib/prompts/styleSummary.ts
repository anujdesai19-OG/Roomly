export function buildStyleSummaryPrompt(itemNames: string[], style: string, palette: string[]): string {
  return `Write a 2-sentence interior design rationale for a ${style} room featuring: ${itemNames.slice(0, 6).join(', ')}.
The color palette centers on ${palette.join(' and ')}.
Tone: warm, professional, encouraging. Max 60 words. No bullet points, no headers.`
}
