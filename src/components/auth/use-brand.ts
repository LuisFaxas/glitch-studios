"use client"
import { createContext, useContext } from "react"
import type { Brand } from "@/lib/brand"

export const BrandContext = createContext<Brand>("studios")

export function useBrand(): Brand {
  return useContext(BrandContext)
}
