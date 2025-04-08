// Update ColorContextProvider.tsx
import React, { createContext, useContext, useState, useEffect, Suspense } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

type ColorContextType = {
  selectedColor: string
  setSelectedColor: (color: string) => void
  optionType: string
  setOptionType: (type: string) => void
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
  initialOptionType = "color",
}: {
  children: React.ReactNode
  initialColor: string
  initialOptionType?: string
}) {
  const [selectedColor, setSelectedColor] = useState(initialColor)
  const [optionType, setOptionType] = useState(initialOptionType)
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
        optionType,
        setOptionType,
      }}
    >
      {children}
    </ColorContext.Provider>
  )
}

export const ColorContextProvider = ({
  children,
  initialColor,
  initialOptionType,
}: {
  children: React.ReactNode
  initialColor: string
  initialOptionType?: string
}) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ColorContextInner initialColor={initialColor} initialOptionType={initialOptionType}>
        {children}
      </ColorContextInner>
    </Suspense>
  )
}