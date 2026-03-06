'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { RetailerConfig } from '@/types/retailer'

const RetailerContext = createContext<RetailerConfig | null>(null)

export function RetailerProvider({ config, children }: { config: RetailerConfig; children: ReactNode }) {
  return <RetailerContext.Provider value={config}>{children}</RetailerContext.Provider>
}

export function useRetailer(): RetailerConfig {
  const ctx = useContext(RetailerContext)
  if (!ctx) throw new Error('useRetailer must be used within RetailerProvider')
  return ctx
}
