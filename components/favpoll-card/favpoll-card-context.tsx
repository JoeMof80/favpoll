import { createContext, useContext } from 'react'
import type { FavpollCardSize } from './types'

const FavpollCardContext = createContext<{ size: FavpollCardSize }>({ size: 'full' })
export const FavpollCardProvider = FavpollCardContext.Provider
export const useFavpollCard = () => useContext(FavpollCardContext)
