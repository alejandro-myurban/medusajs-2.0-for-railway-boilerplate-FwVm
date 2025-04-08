"use client"

import React, { createContext, useContext, useState, Suspense } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

type ColorContextType = {
  selectedColor: string
  setSelectedColor: (color: string) => void
}

const ColorContext = createContext<ColorContextType | undefined>(undefined)

export const useColorContext = () => {
  const context = useContext(ColorContext)
  if (!context) {
    throw new Error(
      "useColorContext must be used within a ColorContextProvider"
    )
  }
  return context
}

function ColorContextInner({
  children,
  initialColor,
}: {
  children: React.ReactNode
  initialColor: string
}) {
  const [selectedColor, setSelectedColor] = useState(initialColor)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Update URL when color changes
  const updateColor = (color: string) => {
    setSelectedColor(color)

    const params = new URLSearchParams(searchParams?.toString() || "")
    if (color) {
      params.set("color", color)
    } else {
      params.delete("color")
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <ColorContext.Provider
      value={{
        selectedColor,
        setSelectedColor: updateColor,
      }}
    >
      {children}
    </ColorContext.Provider>
  )
}

export const ColorContextProvider = ({
  children,
  initialColor,
}: {
  children: React.ReactNode
  initialColor: string
}) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ColorContextInner initialColor={initialColor}>
        {children}
      </ColorContextInner>
    </Suspense>
  )
}