'use client'
import React, { Suspense, useMemo, useState } from "react"
import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import ProductActionsWrapper from "./product-actions-wrapper"
import { HttpTypes } from "@medusajs/types"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  // Estado para el color seleccionado
  const [selectedColor, setSelectedColor] = useState<string | null>(null)

  // Filtrar imágenes basadas en el color seleccionado
  const filteredImages = useMemo(() => {
    if (!selectedColor || !product.images || product.images.length === 0) {
      return product.images || []
    }

    // Filtrar las imágenes que contengan el color seleccionado en su URL
    // Esto funciona si tus imágenes se llaman "tee-black-front", "tee-white-front", etc.
    const filtered = product.images.filter((img) => {
      const lowerUrl = img.url.toLowerCase()
      const lowerColor = selectedColor.toLowerCase()

      return (
        lowerUrl.includes(`-${lowerColor}-`) ||
        lowerUrl.includes(`-${lowerColor}.`) ||
        lowerUrl.includes(`_${lowerColor}_`) ||
        lowerUrl.includes(`_${lowerColor}.`)
      )
    })

    // Si no encontramos imágenes, devolver todas (como fallback)
    return filtered.length > 0 ? filtered : product.images
  }, [selectedColor, product.images])

  // Función para manejar el cambio de color
  const handleColorChange = (colorValue: string | null) => {
    setSelectedColor(colorValue)
  }

  return (
    <>
      <div
        className="content-container flex flex-col small:flex-row small:items-start py-6 relative"
        data-testid="product-container"
      >
        <div className="flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full py-8 gap-y-6">
          <ProductInfo product={product} />
          <ProductTabs product={product} />
        </div>
        <div className="block w-full relative">
          <ImageGallery images={filteredImages} />
        </div>
        <div className="flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full py-8 gap-y-12">
          <ProductOnboardingCta />
          <Suspense
            fallback={
              <ProductActions
                disabled={true}
                product={product}
                region={region}
              />
            }
          >
            <ProductActionsWrapper
              id={product.id}
              region={region}
              onColorChange={handleColorChange}
            />
          </Suspense>
        </div>
      </div>
      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
