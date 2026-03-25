"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react"
import type { CartItem } from "@/types/beats"

const STORAGE_KEY = "glitch-cart"

interface CartState {
  items: CartItem[]
  isOpen: boolean
  isMounted: boolean
  addItem: (item: CartItem) => void
  removeItem: (beatId: string, licenseTier: string) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  total: number
  itemCount: number
}

const CartContext = createContext<CartState | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Hydrate from localStorage on mount (client-only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setItems(parsed)
        }
      }
    } catch {
      // Ignore parse errors
    }
    setIsMounted(true)
  }, [])

  // Persist to localStorage when items change (skip initial empty state before hydration)
  useEffect(() => {
    if (!isMounted) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Ignore storage errors (quota exceeded, etc.)
    }
  }, [items, isMounted])

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      // Don't add duplicate (same beat + same tier)
      const exists = prev.some(
        (i) => i.beatId === item.beatId && i.licenseTier === item.licenseTier
      )
      if (exists) return prev
      return [...prev, item]
    })
  }, [])

  const removeItem = useCallback((beatId: string, licenseTier: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.beatId === beatId && i.licenseTier === licenseTier))
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), [])

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price, 0),
    [items]
  )

  const itemCount = items.length

  const value = useMemo<CartState>(
    () => ({
      items,
      isOpen,
      isMounted,
      addItem,
      removeItem,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
      total,
      itemCount,
    }),
    [
      items,
      isOpen,
      isMounted,
      addItem,
      removeItem,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
      total,
      itemCount,
    ]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartState {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
