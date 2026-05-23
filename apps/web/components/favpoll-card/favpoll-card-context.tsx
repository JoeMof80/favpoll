"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { createStore, useStore } from "zustand"
import type { FavpollCardSize } from "./types"

type CardState = { size: FavpollCardSize }
type CardStore = ReturnType<typeof createCardStore>

const createCardStore = (size: FavpollCardSize) =>
  createStore<CardState>()(() => ({ size }))

const CardStoreContext = createContext<CardStore | null>(null)

export function FavpollCardProvider({
  children,
  value,
}: {
  children: ReactNode
  value: { size: FavpollCardSize }
}) {
  const [store] = useState(() => createCardStore(value.size))
  return (
    <CardStoreContext.Provider value={store}>
      {children}
    </CardStoreContext.Provider>
  )
}

/** Returns the card-scoped state. Falls back to size="full" when used outside a provider. */
export function useFavpollCard(): CardState {
  const store = useContext(CardStoreContext)
  if (!store) return { size: "full" }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useStore(store)
}
