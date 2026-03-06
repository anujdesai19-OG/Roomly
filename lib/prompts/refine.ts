interface SwapCandidate {
  id: string
  name: string
  priceUsd: number
  category: string
  styleIds: string[]
  colorFamily: string[]
}

interface RefinePromptOptions {
  currentPlanJson: string // JSON.stringify of current ClaudePlanOutput
  instruction: string
  availableSwaps: SwapCandidate[]
  designStyle: string
  colorPalette: string[]
}

export function buildRefinePrompt(opts: RefinePromptOptions): string {
  const { currentPlanJson, instruction, availableSwaps, designStyle, colorPalette } = opts

  const swapLines = availableSwaps
    .map((p) => `ID:${p.id}|${p.name}|$${Math.round(p.priceUsd / 100)}|${p.category}|styles:${p.styleIds.join(',')}|colors:${p.colorFamily.join(',')}`)
    .join('\n')

  return `You are an interior designer refining a room plan based on client feedback.

CURRENT PLAN (JSON):
${currentPlanJson}

AVAILABLE REPLACEMENT PRODUCTS (from the same retailer catalog):
${swapLines || '(no swaps available — keep existing items)'}

CLIENT INSTRUCTION: "${instruction}"

RULES:
1. Only swap/add/remove items using products from AVAILABLE REPLACEMENT PRODUCTS
2. Maintain overall style coherence (${designStyle}, palette: ${colorPalette.join(', ')})
3. Stay within the original room budget where possible
4. Preserve all items the client did NOT ask to change
5. Update styleRationale to reflect any changes made

OUTPUT: Return the complete updated plan JSON in the exact same schema as the input.
Add a "changesSummary" field (1-2 sentences: what changed and why).
JSON only, no prose, no markdown fences.`
}
