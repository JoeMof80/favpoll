"use client"

import { createContext, useContext, useState } from "react"

type EditModeContextType = {
  editMode: boolean
  setEditMode: (v: boolean) => void
}

const EditModeContext = createContext<EditModeContextType>({
  editMode: false,
  setEditMode: () => {},
})

export function EditModeProvider({ children }: { children: React.ReactNode }) {
  const [editMode, setEditMode] = useState(false)
  return (
    <EditModeContext value={{ editMode, setEditMode }}>
      {children}
    </EditModeContext>
  )
}

export function useEditMode() {
  return useContext(EditModeContext)
}
