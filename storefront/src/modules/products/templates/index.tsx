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
import { ColorContextProvider } from "../../../lib/context/color-content-provider"
import ClientImageGallery from "../../products/components/image-gallery/client-image-gallery"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  searchParams?: { [key: string]: string | string[] | undefined }
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  searchParams,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  // Get color option from product
  const ProductTemplate: React.FC<ProductTemplateProps> = ({
    product,
    region,
    countryCode,
    searchParams,
  }) => {
    if (!product || !product.id) {
      return notFound()
    }

    // Find the variant option that determines images (color, base, etc.)
    const colorOption = product.options?.find(
      (opt) => opt.title === "Color" || opt.title === "Base"
    )
    const colorValues = colorOption?.values || []

    // Validate color from parameters
    const selectedColorParam = searchParams?.color?.toString() || ""
    const isValidColor = colorValues.some((v) => v.value === selectedColorParam)

    const initialColor = isValidColor
      ? selectedColorParam
      : colorValues[0]?.value || ""

    console.log("Initial color:", initialColor)
    console.log(
      "Color values:",
      colorValues.map((v) => v.value)
    )

    return (
      <ColorContextProvider initialColor={initialColor}>
        <div
          className="content-container flex flex-col small:flex-row small:items-start py-6 relative"
          data-testid="product-container"
        >
          <div className="flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full py-8 gap-y-6">
            <ProductInfo product={product} />
            <ProductTabs product={product} />
          </div>
          <div className="block w-full relative">
            <ClientImageGallery images={product.images || []} />
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
              <ProductActionsWrapper id={product.id} region={region} />
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
      </ColorContextProvider>
    )
  }
}

export default ProductTemplate
