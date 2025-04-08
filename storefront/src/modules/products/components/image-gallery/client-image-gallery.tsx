"use client"

import ImageGallery from "@modules/products/components/image-gallery"
import { HttpTypes } from "@medusajs/types"
import { useColorContext } from "@lib/context/color-content-provider"
import { useEffect, useState } from "react"

type ClientImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

export default function ClientImageGallery({ images }: ClientImageGalleryProps) {
  const { selectedColor } = useColorContext()
  const [filteredImages, setFilteredImages] = useState(images)
  
  useEffect(() => {
    // Siempre mostrar al menos una imagen
    if (!selectedColor || images.length === 0) {
      setFilteredImages(images)
      return
    }
    
    // Filtrar imágenes basadas en el valor de la opción Base
    const filtered = images.filter((img) => {
      const lowerUrl = img.url.toLowerCase()
      
      // Parsear el valor seleccionado para buscar "con" o "sin"
      if (selectedColor.toLowerCase() === "con base") {
        return lowerUrl.includes("con")
      } else if (selectedColor.toLowerCase() === "sin base") {
        return lowerUrl.includes("sin")
      } else {
        // Para otros casos (como colores), usar el método original
        return lowerUrl.includes(selectedColor.toLowerCase())
      }
    })
    
    // Si no hay imágenes que coincidan con el filtro, mostrar todas las imágenes
    if (filtered.length === 0) {
      setFilteredImages(images)
    } else {
      setFilteredImages(filtered)
    }
  }, [selectedColor, images])
  
  return <ImageGallery images={filteredImages} />
}