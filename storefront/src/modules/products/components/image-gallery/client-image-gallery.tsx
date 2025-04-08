"use client"

import ImageGallery from "@modules/products/components/image-gallery"
import { HttpTypes } from "@medusajs/types"
import { useColorContext } from "@lib/context/color-content-provider"

type ClientImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

export default function ClientImageGallery({ images }: ClientImageGalleryProps) {
  const { selectedColor, optionType } = useColorContext()
  
  // Filter images based on selected color
  const filteredImages = images.filter((img) => {
    if (!selectedColor) return true
    const lowerUrl = img.url.toLowerCase()
    const lowerColor = selectedColor.toLowerCase()
    return lowerUrl.includes(lowerColor)
  })
  
  return <ImageGallery images={filteredImages} />
}